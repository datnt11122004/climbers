'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppStoreSpyService, AppTriggerAlert } from '@/services/appstorespy.service';
import { Loader2, Play, RefreshCw, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function TriggerBadge({ type }: { type: 'NT1' | 'NT2' }) {
  const isNT2 = type === 'NT2';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${isNT2 ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-violet-500/15 text-violet-400 border-violet-500/30'}`}>
      {isNT2 ? <AlertTriangle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {type}
    </span>
  );
}

export function AlertsTab() {
  const [alerts, setAlerts] = useState<AppTriggerAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [triggerType, setTriggerType] = useState<'NT1' | 'NT2' | ''>('');
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AppStoreSpyService.getAlerts({ triggerType: triggerType || undefined, page, limit });
      setAlerts(res.data);
      setTotal(res.meta.total);
    } finally { setLoading(false); }
  }, [triggerType, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 bg-[#1e293b] rounded-lg border border-[#334155]">
          {(['', 'NT1', 'NT2'] as const).map((t) => (
            <button key={t} onClick={() => { setTriggerType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${triggerType === t ? 'bg-[#6366f1] text-white' : 'text-[#64748b] hover:text-[#94a3b8]'}`}>
              {t === '' ? 'Tất cả' : t}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <span className="ml-auto text-xs text-[#64748b]">Tổng: {total} alerts</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-[#6366f1] animate-spin" /></div>
      ) : (
        <>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-[#475569]">Chưa có trigger alert nào</div>
            ) : alerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-[#1e293b] rounded-xl border border-[#334155] hover:border-[#6366f1]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {alert.trackedApp?.icon ? (
                      <img src={alert.trackedApp.icon} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center flex-shrink-0">
                        <Play className="w-4 h-4 text-[#6366f1]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#f1f5f9] truncate">{alert.trackedApp?.name || `App #${alert.trackedAppId}`}</p>
                      <p className="text-xs text-[#64748b] font-mono truncate">{alert.trackedApp?.appId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TriggerBadge type={alert.triggerType} />
                    <span className="text-xs text-[#64748b] whitespace-nowrap">{fmtDate(alert.triggerDate)}</span>
                  </div>
                </div>

                {/* D-2 / D-1 / D0 stats */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'D-2', val: alert.d2Downloads, cls: 'text-[#94a3b8]' },
                    { label: 'D-1', val: alert.d1Downloads, cls: 'text-blue-400' },
                    { label: 'D0 (hôm nay)', val: alert.d0Downloads, cls: 'text-emerald-400' },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className="bg-[#0f172a] rounded-lg p-3 text-center">
                      <p className="text-xs text-[#64748b] mb-1">{label}</p>
                      <p className={`text-lg font-bold ${cls}`}>{fmtNum(val)}</p>
                      <p className="text-[10px] text-[#475569]">downloads</p>
                    </div>
                  ))}
                </div>

                {/* Growth */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-[#64748b]">Growth rate:</span>
                  <span className="text-sm font-bold text-emerald-400">×{alert.growthRate.toFixed(2)}</span>
                  {alert.notes && (
                    <p className="ml-auto text-xs text-[#475569] italic line-clamp-1">{alert.notes}</p>
                  )}
                </div>
              </div>
            ))}
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
