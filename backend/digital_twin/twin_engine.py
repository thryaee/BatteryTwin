"""
digital_twin/twin_engine.py
---------------------------
The Digital Twin Engine.

Responsibilities:
1. Receive a raw sensor reading (from MQTT handler or simulator).
2. Update the in-memory TwinState.
3. Run the AI agent pipeline (LangGraph).
4. Apply relay safety logic.
5. Persist results to the database.
6. Broadcast the updated state to all WebSocket clients.

This module is the central hub that coordinates all sub-systems.
"""

import asyncio
import time
from datetime import datetime

from config import settings
from digital_twin.twin_state import TwinState
from utils.logger import get_logger
from utils.constants import (
    SOURCE_SIMULATOR, SOURCE_ESP32,
    TEMP_HOT, SOC_CRITICAL_LOW,
)

logger = get_logger(__name__)

# ── Singleton twin state ───────────────────────────────────────────
_twin = TwinState()
_start_time = time.time()

# Circular import guard: these are set after all modules are loaded
_agent_pipeline = None          # set by agents/graph.py on startup
_relay_controller = None        # set by relay/relay_controller.py on startup
_ws_broadcast = None            # set by api/websocket_routes.py on startup
_db_session_factory = None      # set by main.py on startup


def get_twin() -> TwinState:
    """Return the current in-memory Digital Twin state."""
    return _twin


def register_agent_pipeline(pipeline_fn):
    """Inject the LangGraph pipeline runner (avoids circular imports)."""
    global _agent_pipeline
    _agent_pipeline = pipeline_fn
    logger.info("Agent pipeline registered with twin engine.")


def register_relay_controller(relay_fn):
    """Inject the relay controller function."""
    global _relay_controller
    _relay_controller = relay_fn
    logger.info("Relay controller registered with twin engine.")


def register_ws_broadcast(broadcast_fn):
    """Inject the WebSocket broadcast coroutine."""
    global _ws_broadcast
    _ws_broadcast = broadcast_fn
    logger.info("WebSocket broadcaster registered with twin engine.")


def register_db_session_factory(factory):
    """Inject the SQLAlchemy session factory."""
    global _db_session_factory
    _db_session_factory = factory
    logger.info("DB session factory registered with twin engine.")


async def process_reading(reading: dict) -> TwinState:
    """
    Main entry point called for every incoming sensor reading.

    Parameters
    ----------
    reading : dict
        Raw payload matching the BATTERY_DATA MQTT schema.

    Returns
    -------
    TwinState
        The updated twin state after all processing.
    """
    global _twin

    # 1. Update uptime
    _twin.uptime_seconds = time.time() - _start_time

    # 2. Apply physical sensor values
    _twin.update_from_sensor(reading)
    logger.debug(
        f"Twin updated | V={_twin.voltage_v:.3f}V "
        f"I={_twin.current_a:.3f}A "
        f"T={_twin.temperature_c:.1f}°C "
        f"SOC={_twin.soc_percent:.1f}%"
    )

    # 3. Run AI agent pipeline (updates SOH, RUL, recommendations)
    if _agent_pipeline is not None:
        try:
            agent_output = await asyncio.get_event_loop().run_in_executor(
                None, _agent_pipeline, _twin.to_dict()
            )
            _apply_agent_output(agent_output)
        except Exception as exc:
            logger.error(f"Agent pipeline error: {exc}", exc_info=True)

    # 4. Evaluate relay safety (may override agent recommendation)
    if _relay_controller is not None:
        try:
            relay_state, relay_reason = _relay_controller(_twin)
            _twin.relay_state = relay_state
            _twin.relay_reason = relay_reason
        except Exception as exc:
            logger.error(f"Relay controller error: {exc}", exc_info=True)

    # 5. Derive battery health label
    _twin.battery_status = _classify_battery_status(_twin)

    # 6. Persist to database
    if _db_session_factory is not None:
        await asyncio.get_event_loop().run_in_executor(None, _persist, _twin)

    # 7. Broadcast to WebSocket clients
    if _ws_broadcast is not None:
        try:
            await _ws_broadcast(_twin.to_dict())
        except Exception as exc:
            logger.warning(f"WebSocket broadcast error: {exc}")

    return _twin


# ── Private helpers ────────────────────────────────────────────────

def _apply_agent_output(output: dict) -> None:
    """Merge coordinator agent output into the twin state."""
    if not output:
        return
    _twin.soh_percent = float(output.get("soh_percent", _twin.soh_percent))
    _twin.rul_cycles = float(output.get("rul_cycles", _twin.rul_cycles))
    _twin.degradation_rate = float(output.get("degradation_rate", _twin.degradation_rate))
    _twin.recommendation = output.get("recommendation", _twin.recommendation)
    _twin.recommendation_priority = output.get("priority", _twin.recommendation_priority)
    _twin.coordinator_output = output
    _twin.cycle_count = float(output.get("cycle_count", _twin.cycle_count))


def _classify_battery_status(twin: TwinState) -> str:
    """Rule-based battery health classification."""
    from utils.constants import SOH_HEALTHY, SOH_DEGRADED, SOH_CRITICAL
    soh = twin.soh_percent
    if soh >= SOH_HEALTHY:
        return "HEALTHY"
    elif soh >= SOH_DEGRADED:
        return "DEGRADED"
    elif soh >= SOH_CRITICAL:
        return "POOR"
    else:
        return "CRITICAL"


def _persist(twin: TwinState) -> None:
    """Save twin state and reading to DB (runs in thread executor)."""
    try:
        from database.crud import create_battery_reading, save_twin_state
        db = _db_session_factory()
        try:
            # Save raw reading
            create_battery_reading(db, {
                "voltage_v": twin.voltage_v,
                "current_a": twin.current_a,
                "temperature_c": twin.temperature_c,
                "soc_percent": twin.soc_percent,
                "power_w": twin.power_w,
                "data_source": twin.data_source,
                "battery_id": twin.battery_id,
            })
            # Save twin snapshot
            save_twin_state(db, {
                "battery_id": twin.battery_id,
                "voltage_v": twin.voltage_v,
                "current_a": twin.current_a,
                "temperature_c": twin.temperature_c,
                "soc_percent": twin.soc_percent,
                "soh_percent": twin.soh_percent,
                "rul_cycles": twin.rul_cycles,
                "degradation_rate": twin.degradation_rate,
                "battery_status": twin.battery_status,
                "charging_status": twin.charging_status,
                "relay_state": twin.relay_state,
                "coordinator_output": twin.coordinator_output,
                "data_source": twin.data_source,
            })
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.error(f"DB persist error: {exc}")
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"DB session error: {exc}")
