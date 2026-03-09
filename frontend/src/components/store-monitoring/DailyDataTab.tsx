'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppStoreSpyService, AppDailyData } from '@/services/appstorespy.service';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function DailyDataTab() {
  const [rows, setRows] = useState<AppDailyData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AppStoreSpyService.getDailyData({ from: from || undefined, to: to || undefined, page, limit });
      setRows(res.data);
      setTotal(res.meta.total);
    } finally { setLoading(false); }
  }, [from, to, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#64748b]">Từ</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#64748b]">Đến</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]" />
        </div>
        <button onClick={load} className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <span className="ml-auto text-xs text-[#64748b]">Tổng: {total.toLocaleString()} bản ghi</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-[#6366f1] animate-spin" /></div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0f172a]">
                  <th className="text-left px-4 py-3 text-[#64748b] font-medium">App</th>
                  <th className="text-left px-4 py-3 text-[#64748b] font-medium">Ngày</th>
                  <th className="text-right px-4 py-3 text-[#64748b] font-medium">Downloads / ngày</th>
                  <th className="text-right px-4 py-3 text-[#64748b] font-medium">Revenue</th>
                  <th className="text-left px-4 py-3 text-[#64748b] font-medium">Version</th>
                  <th className="text-right px-4 py-3 text-[#64748b] font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[#475569]">Không có dữ liệu trong khoảng thời gian này</td></tr>
                ) : rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#1e293b] hover:bg-[#0f172a]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[#f1f5f9] font-medium line-clamp-1 max-w-[200px]">
                        {row.trackedApp?.name || `App #${row.trackedAppId}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">{fmtDate(row.date)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-semibold">{fmtNum(row.downloads)}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#94a3b8] text-xs">
                      {row.revenue > 0 ? `$${fmtNum(row.revenue)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-[#64748b] text-xs font-mono">{row.version || '—'}</td>
                    <td className="px-4 py-3 text-right text-[#94a3b8] text-xs">
                      {row.ratingValue ? `⭐ ${row.ratingValue.toFixed(1)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#334155] text-[#94a3b8] hover:text-white disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#64748b]">Trang {page}/{totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-[#334155] text-[#94a3b8] hover:text-white disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
