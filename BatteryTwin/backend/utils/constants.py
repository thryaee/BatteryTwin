"""
utils/constants.py
------------------
Domain constants used across the backend.
"""

# ── Battery chemistry constants (Li-ion 18650) ─────────────────────
NOMINAL_VOLTAGE_V = 3.7
FULL_CHARGE_VOLTAGE_V = 4.2
CUTOFF_VOLTAGE_V = 2.8
NOMINAL_CAPACITY_MAH = 3000.0      # mAh – adjust for your cell

# ── SOC thresholds ─────────────────────────────────────────────────
SOC_CRITICAL_LOW = 10.0            # %
SOC_LOW = 20.0                     # %
SOC_OPTIMAL_LOW = 30.0             # %
SOC_OPTIMAL_HIGH = 80.0            # %
SOC_HIGH = 90.0                    # %

# ── SOH thresholds ─────────────────────────────────────────────────
SOH_HEALTHY = 80.0                 # % – above this is healthy
SOH_DEGRADED = 60.0                # % – below this needs attention
SOH_CRITICAL = 40.0                # % – replace battery

# ── RUL thresholds (charge cycles) ────────────────────────────────
RUL_HEALTHY_CYCLES = 300
RUL_WARNING_CYCLES = 150
RUL_CRITICAL_CYCLES = 50

# ── Temperature thresholds (°C) ────────────────────────────────────
TEMP_COLD = 5.0
TEMP_OPTIMAL_LOW = 15.0
TEMP_OPTIMAL_HIGH = 35.0
TEMP_WARM = 40.0
TEMP_HOT = 45.0

# ── Charging C-rates ───────────────────────────────────────────────
C_RATE_SLOW = 0.2                  # gentle charge
C_RATE_NORMAL = 0.5
C_RATE_FAST = 1.0
C_RATE_RAPID = 2.0

# ── MQTT QoS ───────────────────────────────────────────────────────
MQTT_QOS_AT_MOST_ONCE = 0
MQTT_QOS_AT_LEAST_ONCE = 1
MQTT_QOS_EXACTLY_ONCE = 2

# ── Data source labels ─────────────────────────────────────────────
SOURCE_SIMULATOR = "SIMULATOR"
SOURCE_ESP32 = "ESP32_HARDWARE"
