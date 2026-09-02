"""
api/battery_routes.py
----------------------
REST endpoints for battery readings and historical data.

Endpoints:
  GET  /api/battery/latest          – latest raw reading
  GET  /api/battery/history         – last N readings
  GET  /api/battery/history/range   – readings in a time range
  POST /api/battery/reading         – inject a manual reading (testing)
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.crud import (
    create_battery_reading,
    get_recent_readings,
    get_readings_in_range,
)
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/battery", tags=["Battery Readings"])


# ── Response schemas ───────────────────────────────────────────────

class BatteryReadingOut(BaseModel):
    id: int
    timestamp: datetime
    voltage_v: float
    current_a: float
    temperature_c: float
    soc_percent: float
    power_w: Optional[float]
    data_source: str
    battery_id: str

    class Config:
        from_attributes = True


class ManualReadingIn(BaseModel):
    """For manually injecting a reading (e.g. from Postman for testing)."""
    voltage_v: float = Field(..., ge=0.0, le=5.0)
    current_a: float = Field(..., ge=-20.0, le=20.0)
    temperature_c: float = Field(..., ge=-40.0, le=100.0)
    soc_percent: float = Field(..., ge=0.0, le=100.0)
    battery_id: str = Field(default="BATTERY_01")
    data_source: str = Field(default="MANUAL_INJECTION")


# ── Endpoints ─────────────────────────────────────────────────────

@router.get("/latest", summary="Get the most recent battery reading")
async def get_latest_reading(
    battery_id: str = Query(default="BATTERY_01"),
    db: Session = Depends(get_db),
):
    readings = get_recent_readings(db, battery_id=battery_id, limit=1)
    if not readings:
        raise HTTPException(status_code=404, detail="No readings found for this battery.")
    r = readings[0]
    return {
        "id": r.id,
        "timestamp": r.timestamp.isoformat(),
        "voltage_v": r.voltage_v,
        "current_a": r.current_a,
        "temperature_c": r.temperature_c,
        "soc_percent": r.soc_percent,
        "power_w": r.power_w,
        "data_source": r.data_source,
        "battery_id": r.battery_id,
    }


@router.get("/history", summary="Get last N battery readings")
async def get_reading_history(
    battery_id: str = Query(default="BATTERY_01"),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    readings = get_recent_readings(db, battery_id=battery_id, limit=limit)
    return {
        "battery_id": battery_id,
        "count": len(readings),
        "readings": [
            {
                "timestamp": r.timestamp.isoformat(),
                "voltage_v": r.voltage_v,
                "current_a": r.current_a,
                "temperature_c": r.temperature_c,
                "soc_percent": r.soc_percent,
                "power_w": r.power_w,
                "data_source": r.data_source,
            }
            for r in readings
        ],
    }


@router.get("/history/range", summary="Get readings within a time range")
async def get_readings_range(
    battery_id: str = Query(default="BATTERY_01"),
    start: datetime = Query(..., description="Start datetime (ISO 8601)"),
    end: datetime = Query(..., description="End datetime (ISO 8601)"),
    db: Session = Depends(get_db),
):
    if end <= start:
        raise HTTPException(status_code=400, detail="'end' must be after 'start'.")
    readings = get_readings_in_range(db, battery_id, start, end)
    return {
        "battery_id": battery_id,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "count": len(readings),
        "readings": [
            {
                "timestamp": r.timestamp.isoformat(),
                "voltage_v": r.voltage_v,
                "current_a": r.current_a,
                "temperature_c": r.temperature_c,
                "soc_percent": r.soc_percent,
                "power_w": r.power_w,
            }
            for r in readings
        ],
    }


@router.post("/reading", summary="Manually inject a battery reading (for testing)")
async def inject_reading(
    body: ManualReadingIn,
    db: Session = Depends(get_db),
):
    """
    Inject a synthetic reading into the system.
    This triggers the full twin engine pipeline (agents, relay, WS broadcast)
    just as a real MQTT message would.
    """
    payload = body.model_dump()
    payload["power_w"] = payload["voltage_v"] * payload["current_a"]

    # Route through the twin engine so agents fire
    from digital_twin.twin_engine import process_reading
    import asyncio
    twin = await process_reading(payload)

    # Also persist directly
    create_battery_reading(db, payload)
    db.commit()

    return {
        "message": "Reading injected and processed.",
        "twin_state": twin.to_dict(),
    }
