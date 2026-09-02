"""
database/crud.py
----------------
CRUD operations for all database models.
Functions return ORM objects; callers are responsible for commit/rollback.
"""

from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.models import BatteryReading, DigitalTwinState, AgentResult, RelayEvent
from utils.logger import get_logger

logger = get_logger(__name__)


# ── BatteryReading ─────────────────────────────────────────────────

def create_battery_reading(db: Session, data: dict) -> BatteryReading:
    reading = BatteryReading(
        voltage_v=data["voltage_v"],
        current_a=data["current_a"],
        temperature_c=data["temperature_c"],
        soc_percent=data["soc_percent"],
        power_w=data.get("power_w", data["voltage_v"] * data["current_a"]),
        data_source=data.get("data_source", "SIMULATOR"),
        battery_id=data.get("battery_id", "BATTERY_01"),
    )
    db.add(reading)
    db.flush()  # get the ID without committing
    return reading


def get_recent_readings(
    db: Session,
    battery_id: str = "BATTERY_01",
    limit: int = 100,
) -> list[BatteryReading]:
    return (
        db.query(BatteryReading)
        .filter(BatteryReading.battery_id == battery_id)
        .order_by(desc(BatteryReading.timestamp))
        .limit(limit)
        .all()
    )


def get_readings_in_range(
    db: Session,
    battery_id: str,
    start: datetime,
    end: datetime,
) -> list[BatteryReading]:
    return (
        db.query(BatteryReading)
        .filter(
            BatteryReading.battery_id == battery_id,
            BatteryReading.timestamp >= start,
            BatteryReading.timestamp <= end,
        )
        .order_by(BatteryReading.timestamp)
        .all()
    )


# ── DigitalTwinState ───────────────────────────────────────────────

def save_twin_state(db: Session, state: dict) -> DigitalTwinState:
    twin = DigitalTwinState(**state)
    db.add(twin)
    db.flush()
    return twin


def get_latest_twin_state(
    db: Session,
    battery_id: str = "BATTERY_01",
) -> Optional[DigitalTwinState]:
    return (
        db.query(DigitalTwinState)
        .filter(DigitalTwinState.battery_id == battery_id)
        .order_by(desc(DigitalTwinState.timestamp))
        .first()
    )


def get_twin_history(
    db: Session,
    battery_id: str = "BATTERY_01",
    hours: int = 24,
) -> list[DigitalTwinState]:
    since = datetime.utcnow() - timedelta(hours=hours)
    return (
        db.query(DigitalTwinState)
        .filter(
            DigitalTwinState.battery_id == battery_id,
            DigitalTwinState.timestamp >= since,
        )
        .order_by(DigitalTwinState.timestamp)
        .all()
    )


# ── AgentResult ────────────────────────────────────────────────────

def save_agent_result(db: Session, result: dict) -> AgentResult:
    agent_result = AgentResult(**result)
    db.add(agent_result)
    db.flush()
    return agent_result


def get_latest_agent_result(
    db: Session,
    battery_id: str = "BATTERY_01",
) -> Optional[AgentResult]:
    return (
        db.query(AgentResult)
        .filter(AgentResult.battery_id == battery_id)
        .order_by(desc(AgentResult.timestamp))
        .first()
    )


def get_agent_history(
    db: Session,
    battery_id: str = "BATTERY_01",
    limit: int = 50,
) -> list[AgentResult]:
    return (
        db.query(AgentResult)
        .filter(AgentResult.battery_id == battery_id)
        .order_by(desc(AgentResult.timestamp))
        .limit(limit)
        .all()
    )


# ── RelayEvent ─────────────────────────────────────────────────────

def log_relay_event(
    db: Session,
    battery_id: str,
    relay_state: bool,
    reason: str,
    triggered_by: str = "SYSTEM",
) -> RelayEvent:
    event = RelayEvent(
        battery_id=battery_id,
        relay_state=relay_state,
        reason=reason,
        triggered_by=triggered_by,
    )
    db.add(event)
    db.flush()
    return event


def get_relay_history(
    db: Session,
    battery_id: str = "BATTERY_01",
    limit: int = 50,
) -> list[RelayEvent]:
    return (
        db.query(RelayEvent)
        .filter(RelayEvent.battery_id == battery_id)
        .order_by(desc(RelayEvent.timestamp))
        .limit(limit)
        .all()
    )
