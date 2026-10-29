/**
 * SimulationLab.jsx
 * -----------------
 * Interactive Stress-Testing, Fault Injection & AI Agent Run Console.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Play,
  Flame,
  Zap,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerAgentRun, overrideRelay } from '../services/api';
import { soundEffects } from '../utils/soundEffects';

export default function SimulationLab({ liveData }) {
  const [runningAgent, setRunningAgent] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [simMessage, setSimMessage] = useState('');

  // Handle manual AI Agent Trigger
  const handleTriggerAgent = async () => {
    soundEffects.playClick();
    setRunningAgent(true);
    setSimMessage('Executing LangGraph agent nodes: SOH -> RUL -> Charging -> Maintenance -> Coordinator...');
    try {
      const res = await triggerAgentRun();
      setAgentResult(res);
      setSimMessage('AI Agent Pipeline executed successfully!');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      setSimMessage(`Agent execution failed: ${err.message}`);
    } finally {
      setRunningAgent(false);
    }
  };

  // Quick relay trip test
  const handleRelayTrip = async () => {
    soundEffects.playRelayToggle(false);
    setSimMessage('Injecting Relay Cut-Off command...');
    try {
      await overrideRelay(false, 'Simulation Lab Emergency Cut-Off Test');
      setSimMessage('Emergency Relay Cut-Off triggered successfully.');
    } catch (err) {
      setSimMessage(`Relay command failed: ${err.message}`);
    }
  };

  const handleRelayRestore = async () => {
    soundEffects.playRelayToggle(true);
    setSimMessage('Restoring Relay state...');
    try {
      await overrideRelay(true, 'Simulation Lab Relay Restored');
      setSimMessage('Charging Relay restored to nominal.');
    } catch (err) {
      setSimMessage(`Relay command failed: ${err.message}`);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="tech-title" style={{ fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={18} color="#f59e0b" />
            DIGITAL TWIN SIMULATION & STRESS TESTING LAB
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
            Execute manual agent inference rounds and simulate extreme operational envelope conditions
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleTriggerAgent}
            disabled={runningAgent}
            className="cyber-button cyber-button-active"
            style={{ padding: '8px 18px' }}
          >
            <Play size={14} />
            {runningAgent ? 'Running LangGraph...' : 'Trigger AI Agent Run'}
          </button>
        </div>
      </div>

      {/* Lab Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Card 1: Safety Interlock Testing */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ShieldAlert size={16} color="#ef4444" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', fontFamily: 'Rajdhani' }}>
              RELAY SAFETY INTERLOCK TEST
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 12 }}>
            Verify automated circuit breaker actuation under simulated thermal or overvoltage faults.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRelayTrip}
              className="cyber-button cyber-button-danger"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Simulate Emergency Cut-Off
            </button>
            <button
              onClick={handleRelayRestore}
              className="cyber-button cyber-button-success"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Restore Relay
            </button>
          </div>
        </div>

        {/* Card 2: AI Pipeline Diagnostic Output */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Radio size={16} color="#00f0ff" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', fontFamily: 'Rajdhani' }}>
              SIMULATOR TELEMETRY STATUS
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
            <div>Data Source Mode: <strong style={{ color: '#00f0ff' }}>{liveData?.data_source || 'SIMULATOR'}</strong></div>
            <div>Total Telemetry Readings: <strong style={{ color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>{liveData?.total_readings?.toLocaleString() || 0}</strong></div>
            <div>Relay State: <strong style={{ color: liveData?.relay_state ? '#10b981' : '#ef4444' }}>{liveData?.relay_state ? 'CLOSED (ON)' : 'OPEN (OFF)'}</strong></div>
          </div>
        </div>
      </div>

      {/* Output Console Banner */}
      {simMessage && (
        <div
          style={{
            background: 'rgba(3, 7, 18, 0.9)',
            border: '1px solid #0284c7',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: '0.78rem',
            color: '#38bdf8',
            fontFamily: 'JetBrains Mono',
          }}
        >
          &gt; {simMessage}
        </div>
      )}
    </div>
  );
}
