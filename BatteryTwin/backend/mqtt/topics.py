"""
mqtt/topics.py
--------------
MQTT topic definitions and payload schema helpers.
All topic strings are derived from config so they are overridable via .env.
"""

from config import settings


class Topics:
    """Centralised MQTT topic registry."""

    # ESP32 publishes sensor data here
    BATTERY_DATA = settings.mqtt_topic_data          # chargex/battery/data

    # Backend publishes relay commands here; ESP32 subscribes
    RELAY_CONTROL = settings.mqtt_topic_relay        # chargex/relay/control

    # Backend publishes processed twin state (optional – for multi-subscriber setups)
    TWIN_STATE = "chargex/twin/state"

    # Heartbeat from ESP32
    HEARTBEAT = "chargex/device/heartbeat"


# ── Expected payload schemas (for documentation + validation) ──────

"""
BATTERY_DATA payload (JSON published by ESP32 / simulator):
{
    "battery_id":    "BATTERY_01",      // string
    "voltage_v":     3.72,              // float, Volts
    "current_a":     1.05,              // float, Amperes (+ve = charging)
    "temperature_c": 28.4,             // float, Celsius
    "soc_percent":   65.3,             // float, 0–100 %
    "data_source":   "ESP32_HARDWARE", // "ESP32_HARDWARE" | "SIMULATOR"
    "timestamp_ms":  1693000000000     // int, Unix ms (optional)
}

RELAY_CONTROL payload (JSON published by backend):
{
    "relay_state": true,    // true = ON (charging allowed), false = OFF
    "reason":      "Temperature exceeded safety threshold"
}
"""
