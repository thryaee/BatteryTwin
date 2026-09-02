"""
mqtt/mqtt_client.py
-------------------
Paho-MQTT wrapper that connects to the broker, subscribes to ESP32 topics,
and calls registered message handlers.

Usage (from FastAPI lifespan):
    from mqtt.mqtt_client import MQTTClient
    client = MQTTClient()
    client.register_handler(Topics.BATTERY_DATA, my_handler)
    await client.start()
    ...
    await client.stop()
"""

import json
import asyncio
import threading
from typing import Callable, Awaitable

import paho.mqtt.client as mqtt

from config import settings
from mqtt.topics import Topics
from utils.logger import get_logger
from utils.constants import MQTT_QOS_AT_LEAST_ONCE

logger = get_logger(__name__)

# Type alias: async handler(topic: str, payload: dict) -> None
MessageHandler = Callable[[str, dict], Awaitable[None]]


class MQTTClient:
    """
    Thread-safe MQTT client.

    Paho runs its own network thread; we bridge incoming messages to
    asyncio by posting coroutines onto the FastAPI event loop.
    """

    def __init__(self) -> None:
        self._client = mqtt.Client(
            client_id="batterytwin-backend",
            clean_session=True,
            protocol=mqtt.MQTTv311,
        )
        self._handlers: dict[str, list[MessageHandler]] = {}
        self._loop: asyncio.AbstractEventLoop | None = None
        self._connected = False

        # Wire Paho callbacks
        self._client.on_connect = self._on_connect
        self._client.on_disconnect = self._on_disconnect
        self._client.on_message = self._on_message

        if settings.mqtt_username:
            self._client.username_pw_set(
                settings.mqtt_username,
                settings.mqtt_password,
            )

    # ── Public API ─────────────────────────────────────────────────

    def register_handler(self, topic: str, handler: MessageHandler) -> None:
        """Register an async callback for a specific MQTT topic."""
        self._handlers.setdefault(topic, []).append(handler)
        logger.debug(f"Registered handler for topic '{topic}'")

    async def start(self) -> None:
        """Connect to broker and start the Paho network loop in a background thread."""
        self._loop = asyncio.get_running_loop()
        try:
            self._client.connect(
                host=settings.mqtt_broker_host,
                port=settings.mqtt_broker_port,
                keepalive=60,
            )
            self._client.loop_start()   # starts Paho's own thread
            logger.info(
                f"MQTT client connecting to "
                f"{settings.mqtt_broker_host}:{settings.mqtt_broker_port}"
            )
        except Exception as exc:
            logger.error(f"MQTT connection failed: {exc}")
            raise

    async def stop(self) -> None:
        """Gracefully disconnect from the broker."""
        self._client.loop_stop()
        self._client.disconnect()
        logger.info("MQTT client disconnected.")

    def publish(self, topic: str, payload: dict, qos: int = MQTT_QOS_AT_LEAST_ONCE) -> None:
        """Publish a JSON payload to a topic (called from any thread)."""
        try:
            self._client.publish(
                topic=topic,
                payload=json.dumps(payload),
                qos=qos,
                retain=False,
            )
            logger.debug(f"Published to '{topic}': {payload}")
        except Exception as exc:
            logger.error(f"MQTT publish error on '{topic}': {exc}")

    @property
    def is_connected(self) -> bool:
        return self._connected

    # ── Paho callbacks (run in Paho's thread) ──────────────────────

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self._connected = True
            logger.info("MQTT broker connection established.")
            # Subscribe to all topics that have registered handlers
            for topic in self._handlers:
                client.subscribe(topic, qos=MQTT_QOS_AT_LEAST_ONCE)
                logger.info(f"Subscribed to MQTT topic: {topic}")
            # Always subscribe to heartbeat
            client.subscribe(Topics.HEARTBEAT, qos=MQTT_QOS_AT_LEAST_ONCE)
        else:
            logger.error(f"MQTT connect failed with return code {rc}")

    def _on_disconnect(self, client, userdata, rc):
        self._connected = False
        if rc != 0:
            logger.warning(f"MQTT unexpected disconnect (rc={rc}). Will auto-reconnect.")
        else:
            logger.info("MQTT client cleanly disconnected.")

    def _on_message(self, client, userdata, msg):
        """
        Called by Paho's thread for every incoming message.
        Decodes JSON and schedules registered async handlers on the asyncio loop.
        """
        topic = msg.topic
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            logger.warning(f"Could not decode MQTT message on '{topic}': {exc}")
            return

        if topic == Topics.HEARTBEAT:
            logger.debug(f"Heartbeat received: {payload}")
            return

        handlers = self._handlers.get(topic, [])
        if not handlers:
            logger.debug(f"No handlers registered for topic '{topic}'")
            return

        if self._loop is None or self._loop.is_closed():
            logger.warning("Event loop unavailable; dropping MQTT message.")
            return

        for handler in handlers:
            # Thread-safe bridge from Paho's thread → asyncio event loop
            asyncio.run_coroutine_threadsafe(
                handler(topic, payload),
                self._loop,
            )


# ── Module-level singleton ─────────────────────────────────────────
mqtt_client = MQTTClient()
