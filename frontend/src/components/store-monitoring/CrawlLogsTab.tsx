'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppStoreSpyService, CrawlLog } from '@/services/appstorespy.service';
import { Loader2, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';

function fmtDateTime(s: string) {
  return new Date(s).toLocaleString('vi-VN');
}

function CrawlStatusBadge({ status }: { status: CrawlLog['status'] }) {
  const map: Record<CrawlLog['status'], { icon: React.ReactNode; label: string; cls: string }> = {
    RUNNING: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Đang chạy', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    SUCCESS: { icon: <CheckCircle2 className="w-3 h-3" />, label: 'Thành công', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    FAILED: { icon: <XCircle className="w-3 h-3" />, label: 'Thất bại', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const { icon, label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {icon}{label}
    </span>
  );
}

interface Props {
  onCrawlTrigger: () => Promise<void>;
}

export function CrawlLogsTab({ onCrawlTrigger }: Props) {
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setLogs(await AppStoreSpyService.getCrawlLogs()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTrigger = async () => {
    setCrawling(true);
    try { await onCrawlTrigger(); await load(); }
    finally { setCrawling(false); }
  };

  const dur = (log: CrawlLog) => {
    if (!log.finishedAt) return '—';
    const ms = new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime();
    return ms >= 60_000 ? `${Math.round(ms / 60_000)}m` : `${Math.round(ms / 1000)}s`;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={handleTrigger} disabled={crawling}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-white hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 transition-all">
          {crawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {crawling ? 'Đang crawl...' : 'Trigger Crawl ngay'}
        </button>
        <button onClick={load} className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <span className="ml-auto text-xs text-[#64748b]">20 lần crawl gần nhất</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-[#6366f1] animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0f172a]">
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Thời điểm bắt đầu</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Status</th>
                <th className="text-right px-4 py-3 text-[#64748b] font-medium">Apps tìm được</th>
                <th className="text-right px-4 py-3 text-[#64748b] font-medium">Apps xử lý</th>
                <th className="text-right px-4 py-3 text-[#64748b] font-medium">Thời gian</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Lỗi</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[#475569]">Chưa có lịch sử crawl</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-[#1e293b] hover:bg-[#0f172a]/50 transition-colors">
                  <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#475569]" />
                      {fmtDateTime(log.startedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3"><CrawlStatusBadge status={log.status} /></td>
                  <td className="px-4 py-3 text-right text-[#f1f5f9] font-medium">{log.totalApps.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={log.processedApps === log.totalApps && log.totalApps > 0 ? 'text-emerald-400 font-medium' : 'text-[#94a3b8]'}>
                      {log.processedApps.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#64748b] text-xs">{dur(log)}</td>
                  <td className="px-4 py-3">
                    {log.errors ? (
                      <span className="text-xs text-red-400 line-clamp-1 max-w-xs" title={log.errors}>{log.errors}</span>
                    ) : (
                      <span className="text-xs text-[#334155]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
