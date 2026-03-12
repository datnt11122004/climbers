'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppStoreSpyService, AppTriggerAlert } from '@/services/appstorespy.service';
import { Bell, TrendingUp, AlertTriangle, Play, X, ArrowRight, Rocket } from 'lucide-react';
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
  const cfg = {
    NT1: { cls: 'bg-violet-500/15 text-violet-400', icon: <TrendingUp className="w-2.5 h-2.5" />, label: 'NT1' },
    NT2: { cls: 'bg-orange-500/15 text-orange-400', icon: <AlertTriangle className="w-2.5 h-2.5" />, label: 'NT2' },
    NT3: { cls: 'bg-emerald-500/15 text-emerald-400', icon: <Rocket className="w-2.5 h-2.5" />, label: 'NT3 – Mới' },
  }[a.triggerType] ?? { cls: 'bg-[#334155] text-[#94a3b8]', icon: null, label: a.triggerType };

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
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
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
  return null;
}
