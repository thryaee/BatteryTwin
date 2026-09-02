/**
 * HealthPanel.jsx
 * ---------------
 * Shows SOH%, RUL (cycles + days), and the history trend chart.
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatusBadge from './StatusBadge';
import BatteryGauge from './BatteryGauge';

function StatBox({ label, value, unit, color = '#f1f5f9', sub }) {
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 10,
        padding: '14px 18px',
        textAlign: 'center',
        flex: 1,
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6, letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>
        {value ?? '—'}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b', marginLeft: 4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 4 }}>{sub}</div>}
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
    SOH: h.soh_percent?.toFixed(1),
    SOC: h.soc_percent?.toFixed(1),
  }));

  return (
    <section>
      <h2 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12, letterSpacing: '0.1em' }}>
        BATTERY HEALTH
      </h2>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Battery gauge */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 20,
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
              color={soh > 80 ? '#4ade80' : soh > 60 ? '#fbbf24' : '#f87171'}
            />
            <StatBox
              label="REMAINING USEFUL LIFE"
              value={rul?.toFixed(0)}
              unit="cycles"
              color="#a78bfa"
              sub={rulDays ? `≈ ${Number(rulDays).toFixed(0)} days` : undefined}
            />
          </div>

          {/* SOH / SOC trend */}
          {chartData.length > 2 && (
            <div
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8 }}>
                SOH & SOC TREND
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sohGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="i" hide />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }}
                    formatter={(v, name) => [`${v}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="SOH" stroke="#4ade80" fill="url(#sohGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="SOC" stroke="#a78bfa" fill="url(#socGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
