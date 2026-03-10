'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { ExternalLink, TrendingUp, AlertTriangle, Rocket } from 'lucide-react';
import { AppStoreSpyService, TrackedAppWithData } from '@/services/appstorespy.service';
import { Loader2 } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Range = { label: string; days: number };
const RANGES: Range[] = [
  { label: '2 tháng', days: 60 },
  { label: '1 tháng', days: 30 },
  { label: '1 tuần', days: 7 },
  { label: '3 ngày', days: 3 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function TriggerBadge({ type }: { type: string }) {
  const cfg: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    NT1: { cls: 'bg-violet-500/15 text-violet-400', icon: <TrendingUp className="w-3 h-3" />, label: 'NT1 – Đẩy đều' },
    NT2: { cls: 'bg-orange-500/15 text-orange-400', icon: <AlertTriangle className="w-3 h-3" />, label: 'NT2 – Vụt lên' },
    NT3: { cls: 'bg-emerald-500/15 text-emerald-400', icon: <Rocket className="w-3 h-3" />, label: 'NT3 – App mới' },
  };
  const c = cfg[type] ?? { cls: 'bg-[#334155] text-[#94a3b8]', icon: null, label: type };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
}

type TooltipProps = { active?: boolean; payload?: any[]; label?: string };
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2 shadow-xl text-xs min-w-[110px]">
      <p className="text-[#64748b] mb-1">{label}</p>
      <p className="text-[#22c55e] font-bold text-sm">{fmtNum(payload[0].value)}</p>
      <p className="text-[#64748b]">installs</p>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function AppDetailView({ appId }: { appId: number }) {
  const [app, setApp] = useState<TrackedAppWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<Range>(RANGES[0]); // default: 2 months

  useEffect(() => {
    AppStoreSpyService.getAppDetail(appId)
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [appId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
      </div>
    );
  }

  if (!app) {
    return <div className="text-center py-20 text-[#64748b]">App không tìm thấy</div>;
  }

  // Sort all daily data ascending
  const allSorted = [...app.dailyData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filter by selected range
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - activeRange.days);
  const filtered = allSorted.filter(d => new Date(d.date) >= cutoff);

  const chartData = filtered.map((d) => ({
    date: fmtDate(d.date),
    installs: d.downloads,
  }));

  const maxInstalls = Math.max(...chartData.map(d => d.installs), 1);
  const latestDownloads = allSorted[allSorted.length - 1]?.downloads ?? 0;
  const uniqueTriggers = [...new Set(app.triggerAlerts.map(a => a.triggerType))];
  const abbreviation = app.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  // XAxis tick interval based on range
  const tickInterval = activeRange.days <= 7 ? 0 : activeRange.days <= 30 ? 4 : 6;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 animate-in">
        <div className="flex items-start gap-5">
          {app.icon ? (
            <img src={app.icon} alt={app.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {abbreviation}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-[#f1f5f9]">{app.name}</h1>
                <a
                  href={`https://play.google.com/store/apps/details?id=${app.appId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#818cf8] hover:underline mt-0.5"
                >
                  <ExternalLink className="w-3 h-3" /> {app.appId}
                </a>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#22c55e]">{fmtNum(latestDownloads)}</p>
                <p className="text-xs text-[#64748b]">installs mới nhất</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {app.category && (
                <span className="text-xs bg-[#334155] text-[#94a3b8] px-2.5 py-1 rounded-full">{app.category}</span>
              )}
              {uniqueTriggers.map((t) => <TriggerBadge key={t} type={t} />)}
              {app.releaseDate && (
                <span className="text-xs text-[#64748b]">
                  📅 Release: {new Date(app.releaseDate).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Install Chart */}
      <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-1">
        {/* Chart header + range selector */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#f1f5f9]">Daily Installs</h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              {chartData.length} ngày · Cao nhất: <span className="text-[#6366f1] font-semibold">{fmtNum(maxInstalls)}</span>
            </p>
          </div>

          {/* Range tabs */}
          <div className="flex items-center gap-1 bg-[#0f172a] rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRange.days === r.days
                    ? 'bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20'
                    : 'text-[#64748b] hover:text-[#94a3b8]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#475569] text-sm">
            Không có dữ liệu trong khoảng {activeRange.label}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtNum}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="installs"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Trigger Alerts */}
      {app.triggerAlerts.length > 0 && (
        <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-2">
          <h2 className="text-base font-semibold text-[#f1f5f9] mb-4">Lịch sử Trigger</h2>
          <div className="space-y-2">
            {app.triggerAlerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#0f172a]/50 border border-[#334155]/50">
                <TriggerBadge type={alert.triggerType} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#94a3b8] truncate">{alert.notes}</p>
                </div>
                <span className="text-[11px] text-[#475569] flex-shrink-0">{fmtDate(alert.triggerDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
