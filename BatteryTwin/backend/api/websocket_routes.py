"""
api/websocket_routes.py
------------------------
WebSocket endpoint for real-time Digital Twin state broadcast.

The React dashboard connects to ws://localhost:8000/ws and receives
a JSON message every time the twin state is updated (every simulator
tick or every MQTT message from ESP32).

Multiple clients can connect simultaneously (fan-out broadcast).
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

# ── Connection manager ────────────────────────────────────────────

class ConnectionManager:
    """Manages the set of active WebSocket connections."""

    def __init__(self):
        self._active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._active.append(ws)
        logger.info(f"WebSocket client connected. Total={len(self._active)}")

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self._active:
            self._active.remove(ws)
        logger.info(f"WebSocket client disconnected. Total={len(self._active)}")

    async def broadcast(self, data: dict) -> None:
        """Send data to all connected clients. Disconnects stale clients."""
        dead: list[WebSocket] = []
        message = json.dumps(data, default=str)

        for ws in list(self._active):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.disconnect(ws)

    @property
    def client_count(self) -> int:
        return len(self._active)


# Module-level manager singleton
manager = ConnectionManager()


# ── WebSocket endpoint ────────────────────────────────────────────

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Connect to this endpoint to receive real-time twin state updates.

    On connect: immediately sends the current twin state.
    Ongoing: receives a new message every data cycle (2s default).
    """
    await manager.connect(websocket)
    try:
        # Send current state immediately on connect
        from digital_twin.twin_engine import get_twin
        twin = get_twin()
        await websocket.send_text(json.dumps(twin.to_dict(), default=str))

        # Keep the connection alive; client can send pings
        while True:
            data = await websocket.receive_text()
            # Echo back any client message (useful for ping/pong)
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as exc:
        logger.warning(f"WebSocket error: {exc}")
        manager.disconnect(websocket)


# ── Broadcast function (called by twin_engine) ─────────────────────

async def broadcast_twin_state(state_dict: dict) -> None:
    """
    Broadcast the updated twin state to all connected dashboard clients.
    Called from digital_twin/twin_engine.py after each processing cycle.
    """
    await manager.broadcast(state_dict)
