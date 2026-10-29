"""
database/models.py
------------------
SQLAlchemy ORM models for the BatteryTwin system.

Tables
------
users               – authenticated user accounts (users and admins)
battery_readings    – raw time-series data from ESP32 / simulator
digital_twin_states – snapshots of the digital twin after each update
agent_results       – coordinator agent outputs (AI recommendations)
relay_events        – relay ON/OFF log for audit trail
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, Float, String, Boolean,
    DateTime, Text, JSON, ForeignKey, Index, Enum as SAEnum,
)
import enum
from database.connection import Base


# ── Role Enum ──────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


# ── User ───────────────────────────────────────────────────────────

class User(Base):
    """
    User account for BatteryTwin authentication.

    Roles:
      user  – read access to battery data and dashboards
      admin – full access including device management and relay control
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(128), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)

    # Account state
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow,
        onupdate=datetime.utcnow, nullable=False,
    )
    last_login_at = Column(DateTime, nullable=True)

    # Password reset token (hashed) – None means no active reset request
    reset_token_hash = Column(String(256), nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User id={self.id} email={self.email!r} role={self.role}>"


class BatteryReading(Base):
    """
    Raw sensor reading – one row per MQTT message.
    data_source distinguishes simulator from real hardware.
    """
    __tablename__ = "battery_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # ── Physical measurements ─────────────────────────────────────
    voltage_v = Column(Float, nullable=False)          # Volts
    current_a = Column(Float, nullable=False)          # Amperes (positive = charging)
    temperature_c = Column(Float, nullable=False)      # Celsius
    soc_percent = Column(Float, nullable=False)        # 0–100 %

    # ── Derived / computed ────────────────────────────────────────
    power_w = Column(Float, nullable=True)             # voltage * current

    # ── Metadata ──────────────────────────────────────────────────
    data_source = Column(String(32), default="SIMULATOR", nullable=False)
    battery_id = Column(String(64), default="BATTERY_01", nullable=False)

    __table_args__ = (
        Index("ix_battery_readings_battery_id_timestamp", "battery_id", "timestamp"),
    )

    def __repr__(self):
        return (
            f"<BatteryReading id={self.id} "
            f"V={self.voltage_v:.3f} I={self.current_a:.3f} "
            f"T={self.temperature_c:.1f} SOC={self.soc_percent:.1f}%>"
        )


class DigitalTwinState(Base):
    """
    Snapshot of the Digital Twin state after each update cycle.
    Includes both physical measurements and AI-derived estimates.
    """
    __tablename__ = "digital_twin_states"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    battery_id = Column(String(64), default="BATTERY_01", nullable=False)

    # ── Physical ──────────────────────────────────────────────────
    voltage_v = Column(Float, nullable=False)
    current_a = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    soc_percent = Column(Float, nullable=False)

    # ── AI estimates ──────────────────────────────────────────────
    soh_percent = Column(Float, nullable=True)         # State of Health 0–100 %
    rul_cycles = Column(Float, nullable=True)          # Remaining Useful Life (cycles)
    degradation_rate = Column(Float, nullable=True)   # % per cycle

    # ── Twin status ───────────────────────────────────────────────
    battery_status = Column(String(32), default="UNKNOWN")   # HEALTHY / DEGRADED / CRITICAL
    charging_status = Column(String(32), default="UNKNOWN")  # CHARGING / DISCHARGING / IDLE
    relay_state = Column(Boolean, default=True)               # True = relay ON (charging allowed)

    # ── Full coordinator output as JSON ──────────────────────────
    coordinator_output = Column(JSON, nullable=True)

    data_source = Column(String(32), default="SIMULATOR", nullable=False)


class AgentResult(Base):
    """
    Stores the output of the Coordinator Agent for each analysis cycle.
    """
    __tablename__ = "agent_results"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    battery_id = Column(String(64), default="BATTERY_01", nullable=False)

    # Individual agent outputs (JSON blobs)
    soh_agent_output = Column(JSON, nullable=True)
    rul_agent_output = Column(JSON, nullable=True)
    charging_agent_output = Column(JSON, nullable=True)
    maintenance_agent_output = Column(JSON, nullable=True)

    # Final coordinator recommendation
    recommendation = Column(Text, nullable=True)
    priority = Column(String(16), default="NORMAL")   # LOW / NORMAL / HIGH / CRITICAL
    coordinator_full_output = Column(JSON, nullable=True)


class RelayEvent(Base):
    """
    Audit log of every relay state change.
    """
    __tablename__ = "relay_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    battery_id = Column(String(64), default="BATTERY_01", nullable=False)

    relay_state = Column(Boolean, nullable=False)     # True = ON, False = OFF
    reason = Column(String(256), nullable=True)       # Why the relay was toggled
    triggered_by = Column(String(64), default="SYSTEM")  # SYSTEM / MANUAL / SAFETY
