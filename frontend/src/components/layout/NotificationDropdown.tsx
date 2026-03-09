'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppStoreSpyService, AppTriggerAlert } from '@/services/appstorespy.service';
import { Bell, TrendingUp, AlertTriangle, Play, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function AlertItem({ a }: { a: AppTriggerAlert }) {
  const isNT2 = a.triggerType === 'NT2';
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#0f172a]/60 transition-colors">
      {a.trackedApp?.icon ? (
        <img src={a.trackedApp.icon} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 mt-0.5" />
      ) : (
        <div className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Play className="w-3.5 h-3.5 text-[#6366f1]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isNT2 ? 'bg-orange-500/15 text-orange-400' : 'bg-violet-500/15 text-violet-400'}`}>
            {isNT2 ? <AlertTriangle className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
            {a.triggerType}
          </span>
          <span className="text-[10px] text-[#475569]">{fmtDate(a.triggerDate)}</span>
        </div>
        <p className="text-xs font-medium text-[#f1f5f9] truncate">{a.trackedApp?.name || `App #${a.trackedAppId}`}</p>
        <p className="text-[10px] text-[#64748b] mt-0.5">
          D-2: {fmtNum(a.d2Downloads)} → D-1: {fmtNum(a.d1Downloads)} → D0:{' '}
          <span className="text-emerald-400 font-semibold">{fmtNum(a.d0Downloads)}</span>
        </p>
      </div>
    </div>
  );
}

export function NotificationDropdown({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AppTriggerAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  // Recalculate dropdown position relative to bell button
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Load on first open
  useEffect(() => {
    if (!open || alerts.length > 0) return;
    setLoading(true);
    AppStoreSpyService.getAlerts({ limit: 10, page: 1 })
      .then((res) => { setAlerts(res.data); setTotal(res.meta.total); })
      .finally(() => setLoading(false));
  }, [open]);

  // Prefetch count on mount
  useEffect(() => {
    AppStoreSpyService.getAlerts({ limit: 1, page: 1 }).then((r) => setTotal(r.meta.total));
  }, []);

  const displayCount = total > 99 ? '99+' : total > 0 ? String(total) : null;

  const dropdown = open ? (
    <div
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      className="w-80 bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
        <span className="text-sm font-semibold text-[#f1f5f9]">Trigger Alerts</span>
        <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#334155]/50">
        {loading ? (
          <p className="text-center text-xs text-[#64748b] py-6">Đang tải...</p>
        ) : alerts.length === 0 ? (
          <p className="text-center text-xs text-[#475569] py-6">Chưa có trigger alert nào</p>
        ) : (
          alerts.map((a) => <AlertItem key={a.id} a={a} />)
        )}
      </div>

      {total > 10 && (
        <div className="border-t border-[#334155] px-4 py-2.5">
          <Link href="/store-monitoring" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 text-xs text-[#818cf8] hover:text-[#a5b4fc] transition-colors font-medium">
            Xem tất cả {total} alerts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className={className}>
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="relative p-1">
        <Bell className={`w-5 h-5 transition-colors ${open ? 'text-[#f1f5f9]' : 'text-[#94a3b8] hover:text-[#f1f5f9]'}`} />
        {displayCount && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-[#ef4444] rounded-full text-[9px] font-bold flex items-center justify-center text-white">
            {displayCount}
          </span>
        )}
      </button>

      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
