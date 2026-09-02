"""
digital_twin/twin_state.py
--------------------------
In-memory representation of the Digital Twin.

The TwinState dataclass mirrors the physical battery at any given moment.
It is updated by twin_engine.py and read by the API / agent pipeline.

All fields are explicitly typed so the JSON serialiser never encounters
unexpected None values in the dashboard WebSocket broadcast.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional

from utils.constants import SOURCE_SIMULATOR


@dataclass
class TwinState:
    """Complete state of the Digital Twin at one point in time."""

    # ── Identity ──────────────────────────────────────────────────
    battery_id: str = "BATTERY_01"
    data_source: str = SOURCE_SIMULATOR   # SOURCE_SIMULATOR | SOURCE_ESP32

    # ── Physical measurements (from sensor / simulator) ───────────
    voltage_v: float = 0.0           # Volts
    current_a: float = 0.0           # Amperes  (+ = charging, - = discharging)
    temperature_c: float = 25.0      # Celsius
    soc_percent: float = 50.0        # State of Charge  0–100 %
    power_w: float = 0.0             # Watts = voltage × current

    # ── AI / ML derived estimates ─────────────────────────────────
    soh_percent: float = 100.0       # State of Health   0–100 %
    rul_cycles: float = 500.0        # Remaining Useful Life (charge cycles)
    degradation_rate: float = 0.0   # % SOH lost per cycle (running average)

    # ── Operational status labels ─────────────────────────────────
    battery_status: str = "HEALTHY"         # HEALTHY / DEGRADED / CRITICAL / UNKNOWN
    charging_status: str = "IDLE"           # CHARGING / DISCHARGING / IDLE

    # ── Relay (safe charging control) ─────────────────────────────
    relay_state: bool = True                # True = relay ON (charging allowed)
    relay_reason: str = "System initialising"

    # ── Agent / recommendation output ─────────────────────────────
    recommendation: str = "Awaiting first data cycle..."
    recommendation_priority: str = "NORMAL"  # LOW / NORMAL / HIGH / CRITICAL
    coordinator_output: Optional[dict] = field(default=None)

    # ── Timestamps ────────────────────────────────────────────────
    last_updated: datetime = field(default_factory=datetime.utcnow)
    uptime_seconds: float = 0.0      # seconds since backend started

    # ── Counters ──────────────────────────────────────────────────
    total_readings: int = 0
    cycle_count: float = 0.0        # estimated charge cycles completed

    def to_dict(self) -> dict:
        """Serialise to a plain dict suitable for JSON / WebSocket broadcast."""
        d = asdict(self)
        # Convert datetime to ISO string
        d["last_updated"] = self.last_updated.isoformat()
        return d

    def update_from_sensor(self, reading: dict) -> None:
        """Apply raw sensor values to the twin (does NOT update derived fields)."""
        self.voltage_v = float(reading.get("voltage_v", self.voltage_v))
        self.current_a = float(reading.get("current_a", self.current_a))
        self.temperature_c = float(reading.get("temperature_c", self.temperature_c))
        self.soc_percent = float(reading.get("soc_percent", self.soc_percent))
        self.power_w = self.voltage_v * self.current_a
        self.data_source = reading.get("data_source", self.data_source)
        self.battery_id = reading.get("battery_id", self.battery_id)
        self.last_updated = datetime.utcnow()
        self.total_readings += 1

        # Infer charging/discharging from current sign
        if self.current_a > 0.05:
            self.charging_status = "CHARGING"
        elif self.current_a < -0.05:
            self.charging_status = "DISCHARGING"
        else:
            self.charging_status = "IDLE"
