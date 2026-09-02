"""
ml/data/synthetic_data.py
--------------------------
Synthetic battery dataset generator.

⚠️  DATA NOTICE
All data produced here is SYNTHETIC. It uses physics-informed equations to
approximate Li-ion behaviour. It is NOT real measured data.

Generates two datasets:
1. cycle_dataset  – one row per charge cycle (used to train SOH & RUL models)
2. timeseries_dataset – second-level readings (used to train degradation model)

Run directly:
    python -m ml.data.synthetic_data
"""

import os
import random
import math
import numpy as np
import pandas as pd
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)

# Output directory relative to this file
_DATA_DIR = Path(__file__).parent


def _ocv_from_soc(soc: float) -> float:
    """Interpolated OCV for Li-ion (same table as simulator)."""
    table = [
        (0, 2.80), (5, 3.00), (10, 3.30), (15, 3.45),
        (20, 3.55), (30, 3.65), (40, 3.72), (50, 3.78),
        (60, 3.83), (70, 3.89), (80, 3.95), (90, 4.05),
        (100, 4.20),
    ]
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
    return 3.7


def generate_cycle_dataset(
    n_batteries: int = 100,
    max_cycles_per_battery: int = 500,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Simulate `n_batteries` batteries each cycling up to `max_cycles_per_battery` times.

    Returns a DataFrame with one row per cycle containing the features
    and targets used to train SOH and RUL models.
    """
    rng = random.Random(seed)
    np.random.seed(seed)
    rows = []

    for bat_id in range(n_batteries):
        # Each battery has slightly different characteristics
        nominal_capacity = rng.uniform(2800, 3200)     # mAh
        initial_soh = rng.uniform(97.0, 100.0)         # %
        ambient_temp = rng.uniform(18.0, 32.0)         # °C
        max_cycles = rng.randint(300, max_cycles_per_battery)

        soh = initial_soh
        capacity = nominal_capacity * soh / 100.0

        for cycle in range(1, max_cycles + 1):
            # Degradation rate accelerates with usage and temperature stress
            temp_stress = max(0.0, (ambient_temp - 25.0) / 10.0)
            cycle_deg = (
                0.02                           # base degradation %/cycle
                + 0.005 * temp_stress          # thermal acceleration
                + 0.003 * rng.gauss(0, 1)     # noise
            )
            soh = max(0.0, soh - cycle_deg)
            capacity = nominal_capacity * soh / 100.0

            # Compute features for this cycle
            avg_voltage = _ocv_from_soc(50.0) - rng.gauss(0, 0.02)
            avg_current = rng.uniform(0.3, 1.5)        # A (C-rate × capacity)
            avg_temp = ambient_temp + rng.gauss(5.0, 2.0)   # cell heats above ambient
            c_rate = (avg_current * 1000.0) / nominal_capacity
            r_internal = 0.05 + (1.0 - soh / 100.0) * 0.20 + rng.gauss(0, 0.003)

            rul = max(0, max_cycles - cycle)
            deg_rate = cycle_deg  # approx per-cycle degradation %

            rows.append({
                "battery_id": bat_id,
                "cycle_number": cycle,
                "voltage_v": round(avg_voltage, 4),
                "current_a": round(avg_current, 4),
                "temperature_c": round(avg_temp, 2),
                "soc_percent": round(rng.uniform(20.0, 80.0), 2),
                "soh_percent": round(soh, 4),
                "rul_cycles": rul,
                "degradation_rate": round(deg_rate, 6),
                "c_rate": round(c_rate, 4),
                "capacity_mah": round(capacity, 2),
                "internal_resistance_ohm": round(r_internal, 5),
                "ambient_temp_c": round(ambient_temp, 2),
                "data_source": "SYNTHETIC",
            })

            if soh < 60.0:
                break   # battery has reached end-of-life

    df = pd.DataFrame(rows)
    logger.info(f"Generated cycle dataset: {len(df)} rows, {df['battery_id'].nunique()} batteries")
    return df


def generate_timeseries_dataset(
    n_batteries: int = 20,
    readings_per_battery: int = 500,
    seed: int = 99,
) -> pd.DataFrame:
    """
    Simulate second-level readings across multiple batteries.
    Used for the degradation prediction model.
    """
    rng = random.Random(seed)
    np.random.seed(seed)
    rows = []

    for bat_id in range(n_batteries):
        soh = rng.uniform(70.0, 100.0)
        soc = rng.uniform(20.0, 80.0)
        temp = rng.uniform(20.0, 35.0)
        r_int = 0.05 + (1.0 - soh / 100.0) * 0.20

        for t in range(readings_per_battery):
            # Simple charging simulation
            current = rng.uniform(0.5, 1.2)
            soc = min(100.0, soc + current * (2.0 / 3600.0) / 3.0 * 100.0)
            voltage = _ocv_from_soc(soc) - current * r_int + rng.gauss(0, 0.003)
            temp += rng.gauss(0.01, 0.05)
            temp = max(15.0, min(50.0, temp))
            power = voltage * current
            soh_drop = 0.0001 * abs(current) + rng.uniform(0, 0.00005)
            soh = max(0.0, soh - soh_drop)
            r_int = 0.05 + (1.0 - soh / 100.0) * 0.20

            rows.append({
                "battery_id": bat_id,
                "timestep": t,
                "voltage_v": round(voltage, 4),
                "current_a": round(current, 4),
                "temperature_c": round(temp, 2),
                "soc_percent": round(soc, 2),
                "soh_percent": round(soh, 4),
                "power_w": round(power, 4),
                "internal_resistance_ohm": round(r_int, 5),
                "degradation_rate": round(soh_drop, 8),
                "data_source": "SYNTHETIC",
            })

    df = pd.DataFrame(rows)
    logger.info(f"Generated timeseries dataset: {len(df)} rows")
    return df


def save_datasets(output_dir: Path | None = None) -> tuple[Path, Path]:
    """Generate and save both datasets to CSV."""
    out = output_dir or _DATA_DIR

    cycle_path = out / "synthetic_battery_cycles.csv"
    ts_path = out / "synthetic_timeseries.csv"

    logger.info("Generating synthetic datasets (this may take a few seconds)...")

    cycle_df = generate_cycle_dataset()
    cycle_df.to_csv(cycle_path, index=False)
    logger.info(f"Saved cycle dataset → {cycle_path}")

    ts_df = generate_timeseries_dataset()
    ts_df.to_csv(ts_path, index=False)
    logger.info(f"Saved timeseries dataset → {ts_path}")

    return cycle_path, ts_path


if __name__ == "__main__":
    save_datasets()
    print("✓ Synthetic datasets saved to ml/data/")
