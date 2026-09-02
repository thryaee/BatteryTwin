"""
relay/relay_controller.py
--------------------------
Safe Charging Control via Relay.

The relay sits between the charger and the battery. When the relay is OFF,
charging is physically interrupted — no software path can override this.

Responsibilities:
  1. Evaluate the TwinState against hard safety thresholds.
  2. Publish a relay command to the MQTT broker (ESP32 subscribes).
  3. Log every relay state change to the database.
  4. Expose a manual override endpoint (used by the dashboard).

Safety thresholds are read from config (.env) so they can be adjusted
without code changes.

Architecture note:
  The relay_controller function is SYNCHRONOUS and pure (no I/O side effects
  by itself). It returns (relay_state, reason). The twin_engine calls it and
  handles MQTT publish + DB logging asynchronously.
"""

import json
from config import settings
from utils.logger import get_logger
from utils.constants import (
    TEMP_HOT,
    SOH_CRITICAL,
)

logger = get_logger(__name__)


def evaluate_relay(twin_state) -> tuple[bool, str]:
    """
    Evaluate whether charging should be allowed based on current twin state.

    Parameters
    ----------
    twin_state : TwinState
        The current in-memory Digital Twin state.

    Returns
    -------
    (relay_on: bool, reason: str)
        relay_on=True  → relay ON  → charging allowed
        relay_on=False → relay OFF → charging cut
    """
    v = twin_state.voltage_v
    i = twin_state.current_a
    t = twin_state.temperature_c
    soc = twin_state.soc_percent
    soh = twin_state.soh_percent

    # ── Hard safety limits (cannot be overridden) ─────────────────
    if t >= settings.relay_max_temp_c:
        return False, (
            f"SAFETY: Temperature {t:.1f}°C ≥ limit {settings.relay_max_temp_c}°C. "
            "Charging cut."
        )

    if v > settings.relay_max_voltage_v and i > 0:
        return False, (
            f"SAFETY: Voltage {v:.3f}V exceeds max {settings.relay_max_voltage_v}V. "
            "Charging cut."
        )

    if v < settings.relay_min_voltage_v:
        return False, (
            f"SAFETY: Voltage {v:.3f}V below minimum {settings.relay_min_voltage_v}V. "
            "Possible cell fault."
        )

    if abs(i) > settings.relay_max_current_a:
        return False, (
            f"SAFETY: Current {abs(i):.3f}A exceeds max {settings.relay_max_current_a}A. "
            "Charging cut."
        )

    if soh <= SOH_CRITICAL and i > 0:
        return False, (
            f"SAFETY: SOH {soh:.1f}% critically low. "
            "Charging disabled to prevent thermal runaway."
        )

    if soc >= 99.5 and i > 0:
        return False, "Battery fully charged (SOC ≥ 99.5%). Relay OFF."

    # ── All checks passed ─────────────────────────────────────────
    return True, "All safety checks passed."


# ── MQTT relay command publisher ───────────────────────────────────

def publish_relay_command(relay_on: bool, reason: str) -> None:
    """
    Publish relay control command to MQTT broker.
    ESP32 subscribes to this topic and physically controls the relay.
    Safe to call from any context (Paho handles thread safety internally).
    """
    try:
        from mqtt.mqtt_client import mqtt_client
        from mqtt.topics import Topics

        payload = {
            "relay_state": relay_on,
            "reason": reason,
        }
        mqtt_client.publish(Topics.RELAY_CONTROL, payload)
        logger.info(
            f"Relay command published: {'ON' if relay_on else 'OFF'} | {reason}"
        )
    except Exception as exc:
        logger.error(f"Failed to publish relay command: {exc}")


# ── DB relay event logger ──────────────────────────────────────────

def log_relay_change(
    battery_id: str,
    relay_on: bool,
    reason: str,
    db_session_factory,
    triggered_by: str = "SYSTEM",
) -> None:
    """Persist a relay event to the database (synchronous, called from executor)."""
    try:
        from database.crud import log_relay_event
        db = db_session_factory()
        try:
            log_relay_event(
                db=db,
                battery_id=battery_id,
                relay_state=relay_on,
                reason=reason,
                triggered_by=triggered_by,
            )
            db.commit()
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"Failed to log relay event: {exc}")
