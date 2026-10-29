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

from database.models import (
    BatteryReading, DigitalTwinState, AgentResult, RelayEvent,
    User, UserRole,
)
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


# ── User ───────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return the User row matching email (case-insensitive) or None."""
    return (
        db.query(User)
        .filter(User.email == email.lower().strip())
        .first()
    )


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    full_name: str,
    email: str,
    hashed_password: str,
    role: UserRole = UserRole.user,
    is_active: bool = True,
    is_verified: bool = False,
) -> User:
    """
    Persist a new user.  Role is assigned by the caller; the public
    registration endpoint MUST always pass role=UserRole.user.
    """
    user = User(
        full_name=full_name.strip(),
        email=email.lower().strip(),
        hashed_password=hashed_password,
        role=role,
        is_active=is_active,
        is_verified=is_verified,
    )
    db.add(user)
    db.flush()   # populate user.id without committing
    return user


def update_last_login(db: Session, user: User) -> None:
    user.last_login_at = datetime.utcnow()
    db.flush()


def deactivate_user(db: Session, user: User) -> None:
    user.is_active = False
    db.flush()


def set_reset_token(
    db: Session,
    user: User,
    token_hash: str,
    expires_at: datetime,
) -> None:
    user.reset_token_hash = token_hash
    user.reset_token_expires_at = expires_at
    db.flush()


def clear_reset_token(db: Session, user: User) -> None:
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    db.flush()


def update_password(db: Session, user: User, new_hashed_password: str) -> None:
    user.hashed_password = new_hashed_password
    user.updated_at = datetime.utcnow()
    db.flush()


def email_exists(db: Session, email: str) -> bool:
    return get_user_by_email(db, email) is not None
