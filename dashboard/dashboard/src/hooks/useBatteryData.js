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

  // Fallback simulated data generator when backend is offline
  const generateSimulatedReading = () => {
    const t = Date.now() / 1000;
    const v = 14.80 + Math.sin(t / 8) * 0.08;
    const i = 2.40 + Math.cos(t / 5) * 0.15;
    const temp = 29.4 + Math.sin(t / 15) * 0.4;
    return {
      voltage_v: parseFloat(v.toFixed(3)),
      current_a: parseFloat(i.toFixed(3)),
      temperature_c: parseFloat(temp.toFixed(1)),
      power_w: parseFloat((v * i).toFixed(2)),
      soc_percent: 85.4,
      soh_percent: 96.2,
      rul_cycles: 850,
      cycle_count: 142,
      battery_status: 'HEALTHY',
      charging_status: 'CHARGING',
      data_source: 'SIMULATOR',
      degradation_rate: 0.002,
      coordinator_output: {
        recommendation: 'Autonomous arbitration active: battery operating within safe electrochemical envelope. Fast charging approved.',
        priority: 'INFO',
        maintenance_summary: {
          overall_priority: 'HEALTHY',
          next_service_cycles: 250,
          top_actions: [
            { priority: 'LOW', category: 'PREVENTIVE', action: 'Inspect terminal connections at cycle 390.', detail: 'Visual torque inspection of cell busbars.' },
            { priority: 'INFO', category: 'BALANCE', action: 'Passive balancing active during top-off.', detail: 'Cell delta-V is nominal at 12 mV.' }
          ]
        }
      }
    };
  };

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
        // Supply simulated telemetry stream if no data exists yet
        setLiveData((prev) => prev || generateSimulatedReading());
      }
    };

    poll(); // immediate first call
    const timer = setInterval(() => {
      if (!connected) {
        poll();
      }
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [connected]);

  // Periodic heartbeat tick for charts when running in simulation/offline mode
  useEffect(() => {
    if (connected) return;
    const simInterval = setInterval(() => {
      setLiveData((curr) => {
        const sim = generateSimulatedReading();
        setHistory((prev) => {
          const next = [...prev, { ...sim, _ts: Date.now() }];
          return next.slice(-HISTORY_LIMIT);
        });
        return sim;
      });
      setLoading(false);
    }, 3000);
    return () => clearInterval(simInterval);
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
