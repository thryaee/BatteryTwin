"""
main.py
-------
FastAPI application entry point for BatteryTwin backend.

Startup sequence:
  1. Load config from .env
  2. Create database tables
  3. Train ML models (if no saved .pkl files found)
  4. Register agent pipeline + relay controller with twin engine
  5. Register WebSocket broadcaster with twin engine
  6. Start MQTT client (real hardware) OR simulator (USE_SIMULATOR=true)
  7. Begin serving HTTP / WebSocket requests

Run:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from utils.logger import get_logger

# ── Rate limiter (applied selectively to auth endpoints) ───────────
limiter = Limiter(key_func=get_remote_address, default_limits=[])

logger = get_logger(__name__)

# ── Lifespan (startup / shutdown) ──────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """All startup logic runs here; cleanup runs after yield."""
    logger.info("=" * 60)
    logger.info("  BatteryTwin Backend starting up")
    logger.info(f"  Mode: {'SIMULATOR' if settings.use_simulator else 'ESP32 HARDWARE'}")
    logger.info(f"  Environment: {settings.app_env}")
    logger.info("=" * 60)

    # ── 1. Database setup ─────────────────────────────────────────
    try:
        from database.connection import create_tables, SessionLocal
        create_tables()
    except Exception as exc:
        logger.error(
            f"Database connection failed: {exc}\n"
            "The system will run WITHOUT database persistence.\n"
            "Fix DB credentials in .env to enable persistence."
        )
        SessionLocal = None

    # ── 2. Train ML models if no saved .pkl files exist ───────────
    from pathlib import Path
    models_dir = Path(settings.ml_model_dir)
    models_exist = (
        (models_dir / "soh_model.pkl").exists()
        and (models_dir / "rul_model.pkl").exists()
        and (models_dir / "degradation_model.pkl").exists()
    )
    if not models_exist:
        logger.info("No trained models found – training now (this takes ~30s)...")
        try:
            from ml.trainer import train_all
            await asyncio.get_event_loop().run_in_executor(None, train_all)
            logger.info("ML model training complete.")
        except Exception as exc:
            logger.error(
                f"ML training failed: {exc}\n"
                "Agents will use rule-based fallbacks."
            )
    else:
        logger.info(f"Trained ML models found in {models_dir}.")

    # ── 3. Register components with twin engine ───────────────────
    from digital_twin import twin_engine
    from agents.graph import run_agent_pipeline
    from relay.relay_controller import evaluate_relay
    from api.websocket_routes import broadcast_twin_state

    twin_engine.register_agent_pipeline(run_agent_pipeline)
    twin_engine.register_relay_controller(evaluate_relay)
    twin_engine.register_ws_broadcast(broadcast_twin_state)

    if SessionLocal is not None:
        twin_engine.register_db_session_factory(SessionLocal)

    # ── 4a. Start MQTT (real hardware mode) ───────────────────────
    if not settings.use_simulator:
        from mqtt.mqtt_client import mqtt_client
        from mqtt.topics import Topics

        async def _on_battery_data(topic: str, payload: dict):
            await twin_engine.process_reading(payload)

        mqtt_client.register_handler(Topics.BATTERY_DATA, _on_battery_data)
        try:
            await mqtt_client.start()
            logger.info("MQTT client started – waiting for ESP32 data.")
        except Exception as exc:
            logger.error(
                f"MQTT connection failed: {exc}\n"
                "Set USE_SIMULATOR=true in .env to run without hardware."
            )

    # ── 4b. Start simulator (software-only mode) ──────────────────
    else:
        from digital_twin.simulator import get_simulator

        simulator = get_simulator()

        async def _simulator_loop():
            await simulator.run(on_reading=twin_engine.process_reading)

        sim_task = asyncio.create_task(_simulator_loop())
        app.state.sim_task = sim_task
        logger.info(
            f"Simulator started "
            f"(interval={settings.simulator_interval_seconds}s, "
            f"switch USE_SIMULATOR=false when hardware is ready)."
        )

    logger.info("BatteryTwin backend ready.")
    logger.info(f"  API docs:  http://localhost:{settings.api_port}/docs")
    logger.info(f"  WebSocket: ws://localhost:{settings.api_port}/ws")

    yield  # ← application runs here

    # ── Shutdown ──────────────────────────────────────────────────
    logger.info("BatteryTwin backend shutting down...")
    if settings.use_simulator and hasattr(app.state, "sim_task"):
        app.state.sim_task.cancel()
        try:
            await app.state.sim_task
        except asyncio.CancelledError:
            pass
    else:
        try:
            from mqtt.mqtt_client import mqtt_client
            await mqtt_client.stop()
        except Exception:
            pass
    logger.info("Shutdown complete.")


# ── FastAPI app ────────────────────────────────────────────────────

app = FastAPI(
    title="BatteryTwin API",
    description=(
        "Digital Twin-Enabled Battery Health and Charging Optimization System.\n\n"
        "**Data Notice:** When running with `USE_SIMULATOR=true`, all battery data "
        "is synthetically generated. ML model predictions are trained on synthetic data."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── Rate limiter state ─────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS (allow React dashboard on localhost:3000) ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ───────────────────────────────────────────────
from api.battery_routes import router as battery_router
from api.twin_routes import router as twin_router
from api.agent_routes import router as agent_router
from api.websocket_routes import router as ws_router
from api.auth_routes import router as auth_router

app.include_router(auth_router)
app.include_router(battery_router)
app.include_router(twin_router)
app.include_router(agent_router)
app.include_router(ws_router)


# ── Health check ──────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "BatteryTwin Backend",
        "status": "running",
        "mode": "SIMULATOR" if settings.use_simulator else "ESP32_HARDWARE",
        "docs": "/docs",
        "websocket": "/ws",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    from digital_twin.twin_engine import get_twin
    from api.websocket_routes import manager

    twin = get_twin()
    return {
        "status": "healthy",
        "twin_readings": twin.total_readings,
        "ws_clients": manager.client_count,
        "data_source": twin.data_source,
        "simulator_active": settings.use_simulator,
        "battery_status": twin.battery_status,
    }
