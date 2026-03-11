'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ExternalLink, TrendingUp, AlertTriangle, Rocket, X, Loader2 } from 'lucide-react';
import { AppStoreSpyService, TrackedAppWithData } from '@/services/appstorespy.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

type Range = { label: string; days: number };
const RANGES: Range[] = [
  { label: '2 tháng', days: 60 },
  { label: '1 tháng', days: 30 },
  { label: '1 tuần', days: 7 },
  { label: '3 ngày', days: 3 },
];

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

// ─── Modal Component ──────────────────────────────────────────────────────────

type AppDetailModalProps = {
  appId: number | null;
  onClose: () => void;
};

export default function AppDetailModal({ appId, onClose }: AppDetailModalProps) {
  const [app, setApp] = useState<TrackedAppWithData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRange, setActiveRange] = useState<Range>(RANGES[0]);

  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    setApp(null);
    AppStoreSpyService.getAppDetail(appId)
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [appId]);

  if (!appId) return null;

  const allSorted = app
    ? [...app.dailyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - activeRange.days);
  const filtered = allSorted.filter(d => new Date(d.date) >= cutoff);
  const chartData = filtered.map(d => ({ date: fmtDate(d.date), installs: d.downloads }));
  const maxInstalls = Math.max(...chartData.map(d => d.installs), 1);
  const latestDownloads = allSorted[allSorted.length - 1]?.downloads ?? 0;
  const uniqueTriggers = app ? [...new Set(app.triggerAlerts.map(a => a.triggerType))] : [];
  const abbreviation = app ? app.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : '';
  const tickInterval = activeRange.days <= 7 ? 0 : activeRange.days <= 30 ? 4 : 6;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#334155] shadow-2xl animate-in"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-[#334155] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#475569] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
          </div>
        ) : !app ? (
          <div className="text-center py-20 text-[#64748b]">App không tìm thấy</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-5">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {abbreviation}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap pr-8">
                  <div>
                    <h2 className="text-xl font-bold text-[#f1f5f9]">{app.name}</h2>
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
                  {uniqueTriggers.map(t => <TriggerBadge key={t} type={t} />)}
                  {app.releaseDate && (
                    <span className="text-xs text-[#64748b]">
                      📅 {new Date(app.releaseDate).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-[#0f172a]/60 rounded-2xl p-4 border border-[#334155]/50">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#f1f5f9]">Daily Installs</p>
                  <p className="text-xs text-[#64748b]">
                    {chartData.length} ngày · Cao nhất: <span className="text-[#6366f1] font-semibold">{fmtNum(maxInstalls)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#1e293b] rounded-xl p-1">
                  {RANGES.map(r => (
                    <button
                      key={r.days}
                      onClick={() => setActiveRange(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeRange.days === r.days
                          ? 'bg-[#6366f1] text-white shadow-lg'
                          : 'text-[#64748b] hover:text-[#94a3b8]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-[#475569] text-sm">
                  Không có dữ liệu trong khoảng {activeRange.label}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="modalLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={tickInterval} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtNum} width={48} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="installs"
                      stroke="url(#modalLineGrad)"
                      strokeWidth={2.5}
                      fill="url(#modalAreaGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Trigger History */}
            {app.triggerAlerts.length > 0 && (
              <div className="bg-[#0f172a]/60 rounded-2xl p-4 border border-[#334155]/50">
                <p className="text-sm font-semibold text-[#f1f5f9] mb-3">Lịch sử Trigger</p>
                <div className="space-y-2">
                  {app.triggerAlerts.slice(0, 6).map(alert => (
                    <div key={alert.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1e293b]/60 border border-[#334155]/30">
                      <TriggerBadge type={alert.triggerType} />
                      <p className="flex-1 text-xs text-[#94a3b8] truncate">{alert.notes}</p>
                      <span className="text-[11px] text-[#475569] flex-shrink-0">{fmtDate(alert.triggerDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
