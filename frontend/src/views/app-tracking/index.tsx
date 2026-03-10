'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import {
  Download, RefreshCw, Search, TrendingUp, AlertTriangle,
  Rocket, ExternalLink, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { AppStoreSpyService, TrackedAppWithData, AppDailyData } from '@/services/appstorespy.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// ─── Sparkline: 7 ngày gần nhất với hover tooltip ────────────────────────────

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

type SparklineProps = { data: AppDailyData[] };
function Sparkline({ data }: SparklineProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Always take exactly 7 most-recent days, sorted ascending
  const sorted = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  if (sorted.length === 0) return <span className="text-[#475569] text-xs">—</span>;

  const max = Math.max(...sorted.map((d) => d.downloads), 1);
  const W = 84, H = 36;
  const n = sorted.length;
  const pts = sorted.map((d, i) => ({
    x: n === 1 ? W / 2 : (i / (n - 1)) * W,
    y: Math.max(2, H - (d.downloads / max) * (H - 4)),
    downloads: d.downloads,
    date: d.date,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M${pts.map((p) => `${p.x},${p.y}`).join(' L')} L${W},${H} L0,${H} Z`;

  // Trend: compare first vs last
  const trend = sorted[sorted.length - 1].downloads - sorted[0].downloads;
  const trendColor = trend >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredIdx(null); }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="cursor-pointer overflow-visible">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sparkFill)" />
        <polyline points={polyline} fill="none" stroke="url(#sparkGrad)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Hover hit-areas */}
        {pts.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? 0 : (pts[i - 1].x + p.x) / 2}
            y={0}
            width={i === 0
              ? (pts[1]?.x ?? W) / 2
              : i === pts.length - 1
              ? W - (pts[i - 1].x + p.x) / 2
              : ((pts[i + 1]?.x ?? W) - (pts[i - 1]?.x ?? 0)) / 2}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
          />
        ))}
        {/* Active dot */}
        {hoveredIdx !== null && (
          <circle
            cx={pts[hoveredIdx].x}
            cy={pts[hoveredIdx].y}
            r={4}
            fill="#6366f1"
            stroke="#fff"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Hover tooltip – 7-day mini chart */}
      {hovered && (
        <div className="absolute z-[100] bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-[#1e293b] border border-[#334155] rounded-xl p-3 shadow-2xl pointer-events-none">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-[#94a3b8]">7 ngày gần nhất</p>
            <span className="text-[10px] font-bold" style={{ color: trendColor }}>
              {trend >= 0 ? '▲' : '▼'} {fmtNum(Math.abs(trend))}
            </span>
          </div>
          <div className="space-y-1.5">
            {sorted.map((d, i) => {
              const dow = DOW[new Date(d.date).getDay()];
              const isActive = hoveredIdx === i;
              return (
                <div key={d.date} className={`flex items-center gap-2 rounded-lg px-1.5 py-0.5 transition-colors ${isActive ? 'bg-[#6366f1]/10' : ''}`}>
                  <span className="text-[10px] text-[#64748b] w-5 flex-shrink-0">{dow}</span>
                  <span className="text-[10px] text-[#475569] w-9 flex-shrink-0">{fmtDate(d.date)}</span>
                  <div className="flex-1 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(d.downloads / max) * 100}%`,
                        background: isActive ? '#6366f1' : 'linear-gradient(to right, #6366f1, #06b6d4)',
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold w-11 text-right flex-shrink-0 ${isActive ? 'text-[#a5b4fc]' : 'text-[#94a3b8]'}`}>
                    {fmtNum(d.downloads)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trigger badge ────────────────────────────────────────────────────────────

function TriggerBadge({ type }: { type: string }) {
  const cfg: Record<string, { cls: string; icon: React.ReactNode }> = {
    NT1: { cls: 'bg-violet-500/20 text-violet-300', icon: <TrendingUp className="w-3 h-3" /> },
    NT2: { cls: 'bg-orange-500/20 text-orange-300', icon: <AlertTriangle className="w-3 h-3" /> },
    NT3: { cls: 'bg-emerald-500/20 text-emerald-300', icon: <Rocket className="w-3 h-3" /> },
  };
  const c = cfg[type] ?? { cls: 'bg-[#334155] text-[#94a3b8]', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.cls}`}>
      {c.icon} {type}
    </span>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function AppTrackingView() {
  const router = useRouter();
  const [apps, setApps] = useState<TrackedAppWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');
  const LIMIT = 50;

  const loadApps = useCallback(async (p: number, q: string, trg: string) => {
    setLoading(true);
    try {
      const res = await AppStoreSpyService.getApps({
        page: p,
        limit: LIMIT,
        search: q || undefined,
        triggerType: (trg || undefined) as any,
      });
      setApps(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { loadApps(1, search, triggerFilter); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search, triggerFilter, loadApps]);

  useEffect(() => { loadApps(page, search, triggerFilter); }, [page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-in">
        <Header title="Theo dõi App" description="Dashboard các app có lượt tải tăng trưởng mạnh" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadApps(page, search, triggerFilter)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#334155] text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-all border border-[#334155]"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-5 mb-6 animate-in animate-in-delay-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Trigger Rule</label>
            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]"
            >
              <option value="">Tất cả</option>
              <option value="NT1">NT1 – Đẩy đều</option>
              <option value="NT2">NT2 – Vụt lên</option>
              <option value="NT3">NT3 – App mới release</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên app, bundle ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#64748b] text-[#f1f5f9]"
              />
            </div>
          </div>
          <div className="flex-shrink-0 pt-5">
            <span className="text-xs text-[#475569]">{total.toLocaleString()} apps</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden animate-in animate-in-delay-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748b] text-left border-b border-[#334155] bg-[#0f172a]/50">
                <th className="px-4 py-4 font-medium">App</th>
                <th className="px-4 py-4 font-medium">Dòng</th>
                <th className="px-4 py-4 font-medium text-right">D0 Installs</th>
                <th className="px-4 py-4 font-medium text-center">7 ngày</th>
                <th className="px-4 py-4 font-medium">Trigger</th>
                <th className="px-4 py-4 font-medium">Release</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6366f1] mx-auto" />
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#475569] text-sm">Không tìm thấy app nào</td>
                </tr>
              ) : apps.map((app) => {
                const sortedData = [...app.dailyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const latestD0 = sortedData[0]?.downloads ?? 0;
                const uniqueTriggers = [...new Set(app.triggerAlerts.map(a => a.triggerType))];
                const abbreviation = app.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/app-detail/${app.id}`)}
                    className="hover:bg-[#334155]/30 transition-colors cursor-pointer"
                  >
                    {/* App */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {app.icon ? (
                          <img src={app.icon} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {abbreviation}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#f1f5f9] line-clamp-1">{app.name}</p>
                          <a
                            href={`https://play.google.com/store/apps/details?id=${app.appId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-[#818cf8] hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {app.appId.length > 28 ? app.appId.slice(0, 28) + '…' : app.appId}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      {app.category ? (
                        <span className="text-xs bg-[#334155] text-[#94a3b8] px-2.5 py-1 rounded-full font-medium">{app.category}</span>
                      ) : <span className="text-[#475569]">—</span>}
                    </td>

                    {/* D0 */}
                    <td className="px-4 py-4 text-right font-mono font-semibold text-[#22c55e]">
                      {fmtNum(latestD0)}
                    </td>

                    {/* Sparkline */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <Sparkline data={app.dailyData} />
                      </div>
                    </td>

                    {/* Triggers */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {uniqueTriggers.length > 0
                          ? uniqueTriggers.map((t) => <TriggerBadge key={t} type={t} />)
                          : <span className="text-[#475569]">—</span>}
                      </div>
                    </td>

                    {/* Release */}
                    <td className="px-4 py-4 text-xs text-[#64748b]">
                      {app.releaseDate ? new Date(app.releaseDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-[#334155] flex items-center justify-between">
          <p className="text-sm text-[#94a3b8]">
            Hiển thị <span className="font-semibold text-[#f1f5f9]">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> / <span className="font-semibold text-[#f1f5f9]">{total}</span> apps
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5
                ? i + 1
                : page <= 3 ? i + 1
                : page >= totalPages - 2 ? totalPages - 4 + i
                : page - 2 + i;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    pg === page
                      ? 'bg-[#6366f1] text-white shadow-[#6366f1]/20 shadow-lg'
                      : 'border border-[#334155] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155]'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
