/**
 * hooks/useWebSocket.js
 * ----------------------
 * Custom React hook for the WebSocket connection to the backend.
 *
 * Returns { data, connected, error, lastUpdated }
 *
 * Auto-reconnects with exponential backoff (max 30s).
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
const MAX_BACKOFF_MS = 30_000;

export function useWebSocket() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const wsRef = useRef(null);
  const backoffRef = useRef(1000);
  const reconnectTimer = useRef(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted.current) return;
        setConnected(true);
        setError(null);
        backoffRef.current = 1000; // reset backoff on success
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'pong') return; // ignore ping responses
          setData(parsed);
          setLastUpdated(new Date());
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = (evt) => {
        if (!isMounted.current) return;
        setError('WebSocket connection error');
        setConnected(false);
      };

      ws.onclose = () => {
        if (!isMounted.current) return;
        setConnected(false);
        // Schedule reconnect with backoff
        reconnectTimer.current = setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
          connect();
        }, backoffRef.current);
      };
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
      reconnectTimer.current = setTimeout(connect, backoffRef.current);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    connect();

    // Heartbeat ping every 20s to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 20_000);

    return () => {
      isMounted.current = false;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { data, connected, error, lastUpdated };
}
