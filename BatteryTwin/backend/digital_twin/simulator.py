"""
digital_twin/simulator.py
--------------------------
Battery data simulator.

⚠️  DATA NOTICE
This simulator generates SYNTHETIC battery data using physics-informed
equations. It is intended for:
  - Local development and testing
  - Demo / presentation without real hardware
  - Generating training data for ML models

It does NOT represent a real battery. All values are approximations.
Switch USE_SIMULATOR=false in .env when real ESP32 hardware is connected.

The simulator models a Li-ion 18650 cell undergoing a charge-discharge cycle:
  - Voltage follows the open-circuit voltage (OCV) curve vs SOC
  - Temperature rises with C-rate and falls with ambient cooling
  - Current follows a CC-CV charging profile (constant current → constant voltage)
  - SOC integrates coulomb counting
"""

import asyncio
import math
import random
import time
from datetime import datetime

from config import settings
from utils.logger import get_logger
from utils.constants import (
    SOURCE_SIMULATOR,
    NOMINAL_VOLTAGE_V, FULL_CHARGE_VOLTAGE_V, CUTOFF_VOLTAGE_V,
    NOMINAL_CAPACITY_MAH,
    C_RATE_NORMAL,
)

logger = get_logger(__name__)


class BatterySimulator:
    """
    Simulates a Li-ion battery cycling through charge / discharge / rest phases.
    """

    # ── OCV lookup table (SOC% → Voltage) for Li-ion ──────────────
    # Source: empirical approximation for a generic 18650 cell
    _OCV_TABLE = [
        (0,   2.80), (5,  3.00), (10, 3.30), (15, 3.45),
        (20,  3.55), (30, 3.65), (40, 3.72), (50, 3.78),
        (60,  3.83), (70, 3.89), (80, 3.95), (90, 4.05),
        (100, 4.20),
    ]

    def __init__(
        self,
        battery_id: str = "BATTERY_01",
        initial_soc: float = 60.0,
        initial_soh: float = 95.0,
        ambient_temp: float = 25.0,
    ) -> None:
        self.battery_id = battery_id

        # ── State variables ────────────────────────────────────────
        self.soc = initial_soc               # %
        self.soh = initial_soh               # % (degrades slowly over cycles)
        self.temperature = ambient_temp      # °C
        self.ambient_temp = ambient_temp
        self.cycle_count = 0.0               # fractional charge cycles

        # ── Phase control ──────────────────────────────────────────
        # "charging" → "discharging" → cycling
        self._phase = "charging"
        self._cv_phase = False               # CC→CV transition flag
        self._max_capacity = NOMINAL_CAPACITY_MAH * (self.soh / 100.0)

        # ── Internal resistance (increases with degradation) ───────
        self._r_internal_ohm = 0.05 + (1.0 - self.soh / 100.0) * 0.15

        # ── Noise seeds ────────────────────────────────────────────
        self._noise_seed = random.random() * 100.0

        logger.info(
            f"[SIMULATOR] Initialised battery '{battery_id}' | "
            f"SOC={self.soc:.1f}% SOH={self.soh:.1f}% "
            f"Ambient={self.ambient_temp}°C"
        )

    # ── Public API ─────────────────────────────────────────────────

    def step(self, dt_seconds: float | None = None) -> dict:
        """
        Advance the simulation by one time step.

        Parameters
        ----------
        dt_seconds : float
            Time step in seconds. Defaults to simulator_interval_seconds from config.

        Returns
        -------
        dict
            MQTT-compatible sensor payload.
        """
        dt = dt_seconds or settings.simulator_interval_seconds

        # Determine current for this step
        current_a = self._compute_current()

        # Update SOC via coulomb counting (capacity in mAh, dt in seconds → hours)
        delta_soc = (current_a * 1000.0 * (dt / 3600.0)) / self._max_capacity * 100.0
        self.soc = max(0.0, min(100.0, self.soc + delta_soc))

        # Phase transitions
        self._update_phase()

        # Compute terminal voltage
        ocv = self._ocv_from_soc(self.soc)
        voltage_drop = current_a * self._r_internal_ohm
        voltage = ocv - voltage_drop
        voltage = max(CUTOFF_VOLTAGE_V, min(FULL_CHARGE_VOLTAGE_V + 0.05, voltage))

        # Update temperature (thermal model)
        self.temperature = self._update_temperature(current_a, dt)

        # Track cycle count (one full cycle = 100% SOC swing)
        self.cycle_count += abs(delta_soc) / 100.0

        # Slow SOH degradation (very gradual for demo realism)
        # Real degradation requires a proper cycle count – this is illustrative
        self.soh = max(0.0, self.soh - 0.0001 * abs(delta_soc))
        self._max_capacity = NOMINAL_CAPACITY_MAH * (self.soh / 100.0)
        self._r_internal_ohm = 0.05 + (1.0 - self.soh / 100.0) * 0.15

        # Add small sensor noise (realistic to INA219 noise floor)
        voltage += self._noise(0.002)
        current_a += self._noise(0.005)
        temperature = self.temperature + self._noise(0.1)

        return {
            "battery_id": self.battery_id,
            "voltage_v": round(voltage, 4),
            "current_a": round(current_a, 4),
            "temperature_c": round(temperature, 2),
            "soc_percent": round(self.soc, 2),
            "data_source": SOURCE_SIMULATOR,
            "timestamp_ms": int(time.time() * 1000),
            # Extra simulator metadata (not sent by real ESP32)
            "_sim_phase": self._phase,
            "_sim_soh": round(self.soh, 4),
            "_sim_cycle_count": round(self.cycle_count, 4),
        }

    async def run(self, on_reading) -> None:
        """
        Continuously generate readings and call `on_reading(payload)`.
        Runs until cancelled.

        Parameters
        ----------
        on_reading : coroutine function
            Called with each generated reading dict.
        """
        logger.info(
            f"[SIMULATOR] Starting data generation loop "
            f"(interval={settings.simulator_interval_seconds}s)"
        )
        while True:
            try:
                payload = self.step()
                await on_reading(payload)
            except asyncio.CancelledError:
                logger.info("[SIMULATOR] Stopped.")
                break
            except Exception as exc:
                logger.error(f"[SIMULATOR] Step error: {exc}", exc_info=True)
            await asyncio.sleep(settings.simulator_interval_seconds)

    # ── Private helpers ────────────────────────────────────────────

    def _compute_current(self) -> float:
        """Return the current for the current phase in Amperes."""
        capacity_ah = self._max_capacity / 1000.0

        if self._phase == "charging":
            if not self._cv_phase:
                # CC phase: charge at C_RATE_NORMAL
                return C_RATE_NORMAL * capacity_ah      # positive = charging
            else:
                # CV phase: taper current as SOC approaches 100
                taper = max(0.0, (100.0 - self.soc) / 20.0)
                return C_RATE_NORMAL * capacity_ah * taper

        elif self._phase == "discharging":
            # Discharge at 0.3C
            return -0.3 * capacity_ah                  # negative = discharging

        else:  # rest
            return 0.0

    def _update_phase(self) -> None:
        """Transition between charging / discharging / rest phases."""
        if self._phase == "charging":
            if self.soc >= 95.0:
                self._cv_phase = True
            if self.soc >= 99.5:
                logger.debug("[SIMULATOR] Charge complete → discharging phase")
                self._phase = "discharging"
                self._cv_phase = False

        elif self._phase == "discharging":
            if self.soc <= 15.0:
                logger.debug("[SIMULATOR] Discharge complete → rest phase")
                self._phase = "rest"

        elif self._phase == "rest":
            # Short rest then charge again
            if not hasattr(self, "_rest_counter"):
                self._rest_counter = 0
            self._rest_counter += 1
            if self._rest_counter >= 10:   # 10 steps of rest
                logger.debug("[SIMULATOR] Rest complete → charging phase")
                self._phase = "charging"
                self._rest_counter = 0

    def _ocv_from_soc(self, soc: float) -> float:
        """Interpolate OCV from the lookup table."""
        table = self._OCV_TABLE
        if soc <= table[0][0]:
            return table[0][1]
        if soc >= table[-1][0]:
            return table[-1][1]
        for i in range(len(table) - 1):
            s0, v0 = table[i]
            s1, v1 = table[i + 1]
            if s0 <= soc <= s1:
                t = (soc - s0) / (s1 - s0)
                return v0 + t * (v1 - v0)
        return NOMINAL_VOLTAGE_V

    def _update_temperature(self, current_a: float, dt: float) -> float:
        """
        Simple thermal model: Joule heating + ambient cooling (Newton's law).
        """
        power_dissipated = (current_a ** 2) * self._r_internal_ohm
        heat_capacity = 10.0       # J/°C (approximate for a 18650 cell)
        cooling_coeff = 0.5        # W/°C (natural convection)

        delta_t = (power_dissipated - cooling_coeff * (self.temperature - self.ambient_temp))
        delta_t *= dt / heat_capacity
        return self.ambient_temp + max(0.0, (self.temperature - self.ambient_temp) + delta_t)

    @staticmethod
    def _noise(amplitude: float) -> float:
        """Gaussian noise with given amplitude (±)."""
        return random.gauss(0, amplitude)


# ── Module-level singleton ─────────────────────────────────────────
_simulator_instance: BatterySimulator | None = None


def get_simulator() -> BatterySimulator:
    """Return (or create) the module-level simulator instance."""
    global _simulator_instance
    if _simulator_instance is None:
        _simulator_instance = BatterySimulator()
    return _simulator_instance
