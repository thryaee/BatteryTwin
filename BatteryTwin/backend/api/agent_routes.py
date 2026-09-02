"""
api/agent_routes.py
--------------------
REST endpoints for AI agent results and history.

Endpoints:
  GET  /api/agents/latest           – latest coordinator output
  GET  /api/agents/history          – last N coordinator results
  POST /api/agents/run              – trigger an agent pipeline run on demand
  GET  /api/agents/relay/status     – current relay state
  POST /api/agents/relay/override   – manually toggle relay (dashboard control)
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.crud import (
    get_latest_agent_result,
    get_agent_history,
    save_agent_result,
    log_relay_event,
)
from digital_twin.twin_engine import get_twin
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/agents", tags=["AI Agents"])


# ── Schemas ────────────────────────────────────────────────────────

class RelayOverrideIn(BaseModel):
    relay_state: bool = Field(..., description="true = ON (charge), false = OFF (cut)")
    reason: str = Field(default="Manual override via dashboard")


# ── Endpoints ─────────────────────────────────────────────────────

@router.get("/latest", summary="Get latest AI agent / coordinator output")
async def get_latest_agent_output(
    battery_id: str = "BATTERY_01",
    db: Session = Depends(get_db),
):
    """
    Returns the most recent coordinator agent result from the database.
    Falls back to the in-memory twin's coordinator_output if DB is empty.
    """
    result = get_latest_agent_result(db, battery_id=battery_id)
    if result:
        return {
            "battery_id": result.battery_id,
            "timestamp": result.timestamp.isoformat(),
            "recommendation": result.recommendation,
            "priority": result.priority,
            "coordinator_output": result.coordinator_full_output,
            "source": "database",
        }

    # Fallback to in-memory twin
    twin = get_twin()
    return {
        "battery_id": twin.battery_id,
        "timestamp": twin.last_updated.isoformat(),
        "recommendation": twin.recommendation,
        "priority": twin.recommendation_priority,
        "coordinator_output": twin.coordinator_output,
        "source": "in_memory_twin",
    }


@router.get("/history", summary="Get AI agent result history")
async def get_agent_result_history(
    battery_id: str = "BATTERY_01",
    limit: int = 50,
    db: Session = Depends(get_db),
):
    results = get_agent_history(db, battery_id=battery_id, limit=limit)
    return {
        "battery_id": battery_id,
        "count": len(results),
        "results": [
            {
                "timestamp": r.timestamp.isoformat(),
                "recommendation": r.recommendation,
                "priority": r.priority,
            }
            for r in results
        ],
    }


@router.post("/run", summary="Trigger agent pipeline on current twin state")
async def trigger_agent_run(battery_id: str = "BATTERY_01"):
    """
    Force-run the AI agent pipeline on the current twin state.
    Useful for testing or when you want an immediate fresh analysis.
    """
    try:
        from digital_twin.twin_engine import process_reading, get_twin
        twin = get_twin()
        updated_twin = await process_reading(twin.to_dict())
        return {
            "message": "Agent pipeline executed successfully.",
            "recommendation": updated_twin.recommendation,
            "priority": updated_twin.recommendation_priority,
            "coordinator_output": updated_twin.coordinator_output,
        }
    except Exception as exc:
        logger.error(f"Manual agent run failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/relay/status", summary="Get current relay state")
async def get_relay_status():
    twin = get_twin()
    return {
        "battery_id": twin.battery_id,
        "relay_state": twin.relay_state,
        "relay_reason": twin.relay_reason,
        "charging_status": twin.charging_status,
        "last_updated": twin.last_updated.isoformat(),
    }


@router.post("/relay/override", summary="Manually override relay state")
async def override_relay(
    body: RelayOverrideIn,
    battery_id: str = "BATTERY_01",
    db: Session = Depends(get_db),
):
    """
    Manually set the relay state from the dashboard.

    ⚠️  WARNING: This overrides the automatic safety system.
    Hardware safety limits (over-temperature, over-voltage) on the
    ESP32 side are NOT bypassed by this command.
    """
    from relay.relay_controller import publish_relay_command
    from digital_twin.twin_engine import get_twin

    twin = get_twin()
    old_state = twin.relay_state

    # Update twin state
    twin.relay_state = body.relay_state
    twin.relay_reason = f"MANUAL OVERRIDE: {body.reason}"

    # Publish MQTT command to physical relay
    publish_relay_command(body.relay_state, body.reason)

    # Log to DB
    log_relay_event(
        db=db,
        battery_id=battery_id,
        relay_state=body.relay_state,
        reason=body.reason,
        triggered_by="MANUAL_DASHBOARD",
    )
    db.commit()

    logger.info(
        f"Relay manual override: {old_state} → {body.relay_state} | {body.reason}"
    )

    return {
        "message": "Relay state updated.",
        "previous_state": old_state,
        "new_state": body.relay_state,
        "reason": body.reason,
    }
