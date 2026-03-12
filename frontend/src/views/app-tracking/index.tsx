'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Download, RefreshCw, Search, TrendingUp, AlertTriangle,
  Rocket, ExternalLink, ChevronLeft, ChevronRight, Loader2,
  SortAsc, SortDesc, Plus, X, Filter,
} from 'lucide-react';
import { AppStoreSpyService, TrackedAppWithData, AppDailyData } from '@/services/appstorespy.service';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';

const AppDetailModal = dynamic(() => import('@/components/appstorespy/AppDetailModal'), { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ─── Sparkline ────────────────────────────────────────────────────────────────

type SparklineProps = { data: AppDailyData[] };
function Sparkline({ data }: SparklineProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const sorted = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  if (sorted.length === 0) return <span className="text-[#475569] text-xs">—</span>;

  const max = Math.max(...sorted.map(d => d.downloads), 1);
  const W = 84, H = 36, n = sorted.length;
  const pts = sorted.map((d, i) => ({
    x: n === 1 ? W / 2 : (i / (n - 1)) * W,
    y: Math.max(2, H - (d.downloads / max) * (H - 4)),
    downloads: d.downloads,
    date: d.date,
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M${pts.map(p => `${p.x},${p.y}`).join(' L')} L${W},${H} L0,${H} Z`;
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
        {pts.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? 0 : (pts[i - 1].x + p.x) / 2}
            y={0}
            width={i === 0 ? (pts[1]?.x ?? W) / 2 : i === pts.length - 1 ? W - (pts[i - 1].x + p.x) / 2 : ((pts[i + 1]?.x ?? W) - (pts[i - 1]?.x ?? 0)) / 2}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
          />
        ))}
        {hoveredIdx !== null && (
          <circle cx={pts[hoveredIdx].x} cy={pts[hoveredIdx].y} r={4} fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
        )}
      </svg>

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
                    <div className="h-full rounded-full" style={{ width: `${(d.downloads / max) * 100}%`, background: isActive ? '#6366f1' : 'linear-gradient(to right, #6366f1, #06b6d4)' }} />
                  </div>
                  <span className={`text-[10px] font-semibold w-11 text-right flex-shrink-0 ${isActive ? 'text-[#a5b4fc]' : 'text-[#94a3b8]'}`}>{fmtNum(d.downloads)}</span>
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
  const cfg: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    NT1: { cls: 'bg-violet-500/20 text-violet-300', icon: <TrendingUp className="w-3 h-3" />, label: 'NT1 – App đang đẩy lên đều' },
    NT2: { cls: 'bg-orange-500/20 text-orange-300', icon: <AlertTriangle className="w-3 h-3" />, label: 'NT2 – App tự nhiên đẩy mạnh' },
    NT3: { cls: 'bg-emerald-500/20 text-emerald-300', icon: <Rocket className="w-3 h-3" />, label: 'NT3 – App mới release mà đẩy được' },
  };
  const c = cfg[type] ?? { cls: 'bg-[#334155] text-[#94a3b8]', icon: null, label: type };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.cls}`} title={c.label}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── Add App Modal ────────────────────────────────────────────────────────────

function AddAppModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const isUrl = value.includes('play.google.com');
      const result = await AppStoreSpyService.addTrackedApp(
        isUrl ? { url: value.trim() } : { bundleId: value.trim() }
      );
      setSuccess(`✅ Đã thêm: ${result.name || result.appId || value}`);
      setTimeout(() => { onAdded(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm app. Vui lòng kiểm tra URL/Bundle ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#334155] p-6 shadow-2xl animate-in"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[#f1f5f9]">Thêm App theo dõi</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#334155] flex items-center justify-center text-[#94a3b8] hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Play Store URL hoặc Bundle ID</label>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=... hoặc com.example.app"
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors"
              autoFocus
            />
            <p className="text-[11px] text-[#475569] mt-1.5">Nhập URL từ Google Play Store hoặc bundle ID trực tiếp</p>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">{success}</p>}

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Đang thêm...' : 'Thêm App'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

type SortBy = 'downloads' | 'releaseDate' | 'createdAt' | 'category' | 'triggerDate';

export default function AppTrackingView() {
  const [apps, setApps] = useState<TrackedAppWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');
  const [triggeredOnly, setTriggeredOnly] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('downloads');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const LIMIT = 50;

  const loadApps = useCallback(async (p: number, q: string, trg: string, onlyTriggered: boolean, sBy: SortBy, sDir: 'asc' | 'desc') => {
    setLoading(true);
    try {
      const res = await AppStoreSpyService.getApps({
        page: p,
        limit: LIMIT,
        search: q || undefined,
        triggerType: (trg || undefined) as any,
        triggeredOnly: onlyTriggered,
        sortBy: sBy,
        sortDir: sDir,
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
    const t = setTimeout(() => { loadApps(1, search, triggerFilter, triggeredOnly, sortBy, sortDir); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search, triggerFilter, triggeredOnly, sortBy, sortDir, loadApps]);

  useEffect(() => { loadApps(page, search, triggerFilter, triggeredOnly, sortBy, sortDir); }, [page]);

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const SortIcon = ({ field }: { field: SortBy }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <SortAsc className="w-3 h-3 inline ml-1 text-[#6366f1]" /> : <SortDesc className="w-3 h-3 inline ml-1 text-[#6366f1]" />;
  };

  return (
    <>
      {selectedAppId && (
        <AppDetailModal appId={selectedAppId} onClose={() => setSelectedAppId(null)} />
      )}
      {showAddModal && (
        <AddAppModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => loadApps(1, search, triggerFilter, triggeredOnly, sortBy, sortDir)}
        />
      )}

      <div className="flex items-center justify-between mb-8 animate-in">
        <Header title="Theo dõi App" description="Dashboard các app có lượt tải tăng trưởng mạnh" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-[#6366f1]/20"
          >
            <Plus className="w-4 h-4" /> Thêm App
          </button>
          <button
            onClick={() => loadApps(page, search, triggerFilter, triggeredOnly, sortBy, sortDir)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#334155] text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-all border border-[#334155]"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-5 mb-6 animate-in animate-in-delay-1">
        <div className="flex flex-wrap items-end gap-4">
          {/* Trigger type */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Trigger Rule</label>
            <select
              value={triggerFilter}
              onChange={e => setTriggerFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]"
            >
              <option value="">Tất cả</option>
              <option value="NT1">NT1 – App đang đẩy lên đều</option>
              <option value="NT2">NT2 – App tự nhiên đẩy mạnh</option>
              <option value="NT3">NT3 – App mới release mà đẩy được</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Sắp xếp theo</label>
            <div className="flex flex-wrap gap-1.5">
              {([['downloads', 'Installs'], ['releaseDate', 'Release'], ['createdAt', 'Thêm vào'], ['category', 'Dòng'], ['triggerDate', 'Trigger']] as [SortBy, string][]).map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex-1 px-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    sortBy === field
                      ? 'bg-[#6366f1]/20 border-[#6366f1]/50 text-[#a5b4fc]'
                      : 'bg-[#0f172a] border-[#334155] text-[#64748b] hover:text-[#94a3b8]'
                  }`}
                >
                  {label}
                  <SortIcon field={field} />
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tên app, bundle ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#64748b] text-[#f1f5f9]"
              />
            </div>
          </div>

          {/* Triggered only toggle */}
          <div className="flex-shrink-0">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Bộ lọc</label>
            <button
              onClick={() => setTriggeredOnly(v => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                triggeredOnly
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-[#0f172a] border-[#334155] text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Chỉ có trigger
            </button>
          </div>

          <div className="flex-shrink-0 pb-1">
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
                <th 
                  className="px-4 py-4 font-medium cursor-pointer hover:text-[#f1f5f9] transition-colors select-none"
                  onClick={() => toggleSort('category')}
                >
                  Dòng <SortIcon field="category" />
                </th>
                <th
                  className="px-4 py-4 font-medium text-right cursor-pointer hover:text-[#f1f5f9] transition-colors select-none"
                  onClick={() => toggleSort('downloads')}
                >
                  D0 Installs <SortIcon field="downloads" />
                </th>
                <th className="px-4 py-4 font-medium text-center">7 ngày</th>
                <th className="px-4 py-4 font-medium">Trigger</th>
                <th
                  className="px-4 py-4 font-medium cursor-pointer hover:text-[#f1f5f9] transition-colors select-none"
                  onClick={() => toggleSort('triggerDate')}
                >
                  Ngày kích hoạt <SortIcon field="triggerDate" />
                </th>
                <th
                  className="px-4 py-4 font-medium cursor-pointer hover:text-[#f1f5f9] transition-colors select-none"
                  onClick={() => toggleSort('releaseDate')}
                >
                  Release <SortIcon field="releaseDate" />
                </th>
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
              ) : apps.map(app => {
                const sortedData = [...app.dailyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const latestD0 = sortedData[0]?.downloads ?? 0;
                const uniqueTriggers = [...new Set(app.triggerAlerts.map(a => a.triggerType))];
                const abbreviation = app.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className="hover:bg-[#334155]/30 transition-colors cursor-pointer"
                  >
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
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-[#818cf8] hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {app.appId.length > 28 ? app.appId.slice(0, 28) + '…' : app.appId}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {app.category ? (
                        <span className="text-xs bg-[#334155] text-[#94a3b8] px-2.5 py-1 rounded-full font-medium">{app.category}</span>
                      ) : <span className="text-[#475569]">—</span>}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold text-[#22c55e]">
                      {fmtNum(latestD0)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <Sparkline data={app.dailyData} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {uniqueTriggers.length > 0
                          ? uniqueTriggers.map(t => <TriggerBadge key={t} type={t} />)
                          : <span className="text-[#475569]">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-[#f1f5f9]">
                      {app.triggerAlerts.length > 0 
                        ? (() => {
                            const latest = [...app.triggerAlerts].sort((a,b) => new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime())[0];
                            return new Date(latest.triggerDate).toLocaleDateString('vi-VN');
                          })()
                        : <span className="text-[#475569]">—</span>}
                    </td>
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    pg === page ? 'bg-[#6366f1] text-white shadow-lg' : 'border border-[#334155] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155]'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
