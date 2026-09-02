"""
api/twin_routes.py
-------------------
REST endpoints for Digital Twin state queries.

Endpoints:
  GET  /api/twin/state          – current live twin state
  GET  /api/twin/history        – twin snapshots for last N hours
  GET  /api/twin/stats          – summary statistics
"""

from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from database.crud import get_latest_twin_state, get_twin_history
from digital_twin.twin_engine import get_twin
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/twin", tags=["Digital Twin"])


@router.get("/state", summary="Get current Digital Twin state")
async def get_twin_state(battery_id: str = Query(default="BATTERY_01")):
    """
    Returns the in-memory Digital Twin state (most up-to-date, not from DB).
    This is what the dashboard polls as a fallback to WebSocket.
    """
    twin = get_twin()
    state = twin.to_dict()
    state["source"] = "IN_MEMORY_TWIN"
    return state


@router.get("/history", summary="Get Digital Twin state history")
async def get_twin_history_endpoint(
    battery_id: str = Query(default="BATTERY_01"),
    hours: int = Query(default=24, ge=1, le=168),
    db: Session = Depends(get_db),
):
    snapshots = get_twin_history(db, battery_id=battery_id, hours=hours)
    return {
        "battery_id": battery_id,
        "hours": hours,
        "count": len(snapshots),
        "snapshots": [
            {
                "timestamp": s.timestamp.isoformat(),
                "voltage_v": s.voltage_v,
                "current_a": s.current_a,
                "temperature_c": s.temperature_c,
                "soc_percent": s.soc_percent,
                "soh_percent": s.soh_percent,
                "rul_cycles": s.rul_cycles,
                "degradation_rate": s.degradation_rate,
                "battery_status": s.battery_status,
                "charging_status": s.charging_status,
                "relay_state": s.relay_state,
            }
            for s in snapshots
        ],
    }


@router.get("/stats", summary="Battery statistics summary")
async def get_twin_stats(
    battery_id: str = Query(default="BATTERY_01"),
    db: Session = Depends(get_db),
):
    """Aggregated statistics for the dashboard summary panel."""
    twin = get_twin()
    snapshots = get_twin_history(db, battery_id=battery_id, hours=24)

    if snapshots:
        voltages = [s.voltage_v for s in snapshots]
        temps = [s.temperature_c for s in snapshots]
        sohs = [s.soh_percent for s in snapshots if s.soh_percent]
        stats = {
            "avg_voltage_24h": round(sum(voltages) / len(voltages), 3),
            "max_temp_24h": round(max(temps), 1),
            "min_temp_24h": round(min(temps), 1),
            "avg_soh_24h": round(sum(sohs) / len(sohs), 2) if sohs else None,
            "reading_count_24h": len(snapshots),
        }
    else:
        stats = {
            "avg_voltage_24h": None,
            "max_temp_24h": None,
            "min_temp_24h": None,
            "avg_soh_24h": None,
            "reading_count_24h": 0,
        }

    return {
        "battery_id": battery_id,
        "current": {
            "voltage_v": twin.voltage_v,
            "current_a": twin.current_a,
            "temperature_c": twin.temperature_c,
            "soc_percent": twin.soc_percent,
            "soh_percent": twin.soh_percent,
            "rul_cycles": twin.rul_cycles,
            "battery_status": twin.battery_status,
            "charging_status": twin.charging_status,
            "relay_state": twin.relay_state,
            "data_source": twin.data_source,
            "total_readings": twin.total_readings,
            "uptime_seconds": twin.uptime_seconds,
        },
        "stats_24h": stats,
        "last_updated": twin.last_updated.isoformat(),
    }
