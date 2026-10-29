/**
 * HealthPanel.jsx
 * ---------------
 * Battery Health (SOH) and Remaining Useful Life (RUL) with historical degradation charts.
 */

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ShieldCheck, Clock, HeartPulse } from 'lucide-react';
import StatusBadge from './StatusBadge';
import BatteryGauge from './BatteryGauge';

function StatBox({ label, value, unit, color = '#f1f5f9', sub, icon: Icon }) {
  return (
    <div
      style={{
        background: 'rgba(3, 7, 18, 0.7)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        borderRadius: 10,
        padding: '14px 18px',
        textAlign: 'center',
        flex: 1,
        minWidth: 130,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b', marginBottom: 6, letterSpacing: '0.08em', fontFamily: 'Rajdhani', fontWeight: 700 }}>
        {Icon && <Icon size={14} color={color} />}
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1, fontFamily: 'JetBrains Mono' }}>
        {value ?? '—'}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b', marginLeft: 4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 4, fontFamily: 'JetBrains Mono' }}>{sub}</div>}
    </div>
  );
}

export default function HealthPanel({ liveData, history }) {
  const soh = liveData?.soh_percent;
  const rul = liveData?.rul_cycles;
  const soc = liveData?.soc_percent;
  const charging = liveData?.charging_status === 'CHARGING';
  const batteryStatus = liveData?.battery_status || 'UNKNOWN';
  const coordinator = liveData?.coordinator_output;
  const rulDays = coordinator?.rul_summary?.rul_days || coordinator?.rul_cycles;

  // Build chart data from history
  const chartData = history.slice(-40).map((h, i) => ({
    i,
    SOH: h.soh_percent ? parseFloat(h.soh_percent.toFixed(1)) : 100,
    SOC: h.soc_percent ? parseFloat(h.soc_percent.toFixed(1)) : 50,
  }));

  return (
    <section>
      <h2 className="tech-title" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <HeartPulse size={15} color="#10b981" />
        BATTERY HEALTH & DEGRADATION STATE
      </h2>

      <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Battery gauge */}
          <div
            style={{
              background: 'rgba(3, 7, 18, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <BatteryGauge soc={soc ?? 0} soh={soh ?? 100} charging={charging} />
            <StatusBadge label={batteryStatus} size="lg" />
          </div>

          {/* SOH / RUL stat boxes */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <StatBox
                label="STATE OF HEALTH (SOH)"
                value={soh?.toFixed(1)}
                unit="%"
                color={soh > 80 ? '#10b981' : soh > 60 ? '#f59e0b' : '#ef4444'}
                icon={ShieldCheck}
              />
              <StatBox
                label="REMAINING USEFUL LIFE"
                value={rul?.toFixed(0)}
                unit="cycles"
                color="#a855f7"
                sub={rulDays ? `≈ ${Number(rulDays).toFixed(0)} days` : undefined}
                icon={Clock}
              />
            </div>

            {/* SOH / SOC trend */}
            {chartData.length > 2 && (
              <div
                style={{
                  background: 'rgba(3, 7, 18, 0.6)',
                  border: '1px solid rgba(51, 65, 85, 0.4)',
                  borderRadius: 10,
                  padding: '12px 16px',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8, fontFamily: 'Rajdhani', fontWeight: 700 }}>
                  SOH & SOC REAL-TIME PROJECTION
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sohGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="i" hide />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip
                      contentStyle={{ background: '#030712', border: '1px solid #334155', fontSize: 11, borderRadius: 6 }}
                      formatter={(v, name) => [`${v}%`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="SOH" stroke="#10b981" fill="url(#sohGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="SOC" stroke="#a855f7" fill="url(#socGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
