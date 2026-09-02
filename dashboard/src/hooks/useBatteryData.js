/**
 * hooks/useBatteryData.js
 * ------------------------
 * Combines WebSocket real-time data with REST API polling fallback.
 *
 * Priority: WebSocket (live) > REST poll (fallback every 5s)
 * Also maintains a rolling history array for charts.
 */

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { fetchTwinState } from '../services/api';

const HISTORY_LIMIT = 60;   // keep last 60 data points for charts
const POLL_INTERVAL = parseInt(process.env.REACT_APP_POLL_INTERVAL_MS || '5000', 10);

export function useBatteryData() {
  const { data: wsData, connected, error: wsError, lastUpdated } = useWebSocket();
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Apply new data (from WS or REST)
  const applyData = (newData) => {
    if (!newData) return;
    setLiveData(newData);
    setLoading(false);
    setFetchError(null);
    setHistory(prev => {
      const next = [...prev, { ...newData, _ts: Date.now() }];
      return next.slice(-HISTORY_LIMIT);
    });
  };

  // WebSocket data
  useEffect(() => {
    if (wsData) applyData(wsData);
  }, [wsData]);

  // REST polling fallback (only when WS is disconnected)
  useEffect(() => {
    if (connected) return; // WS is live, no need to poll

    const poll = async () => {
      try {
        const data = await fetchTwinState();
        applyData(data);
      } catch (err) {
        setFetchError(`REST poll failed: ${err.message}`);
        setLoading(false);
      }
    };

    poll(); // immediate first call
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [connected]);

  return {
    liveData,
    history,
    loading,
    connected,
    error: wsError || fetchError,
    lastUpdated,
  };
}
