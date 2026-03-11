'use client';

import { useEffect, useState } from 'react';
import { AppStoreSpyService, AppTriggerAlert } from '@/services/appstorespy.service';
import { Flame, ArrowRight, Play, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function TriggerBadge({ type }: { type: 'NT1' | 'NT2' | 'NT3' }) {
  if (type === 'NT3') {
    return <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">NT3</span>;
  }
  return type === 'NT2'
    ? <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">NT2</span>
    : <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-semibold">NT1</span>;
}

function AlertRow({ alert }: { alert: AppTriggerAlert }) {
  return (
    <tr className="hover:bg-[#334155]/50 transition-colors">
      <td className="py-3">
        <div className="flex items-center gap-3">
          {alert.trackedApp?.icon ? (
            <img src={alert.trackedApp.icon} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <p className="font-medium line-clamp-1 max-w-[140px]">{alert.trackedApp?.name || `App #${alert.trackedAppId}`}</p>
        </div>
      </td>
      <td className="text-right font-mono text-xs text-[#94a3b8]">{fmtNum(alert.d2Downloads)}</td>
      <td className="text-right font-mono text-xs text-blue-400">{fmtNum(alert.d1Downloads)}</td>
      <td className="text-right font-mono text-xs font-semibold text-emerald-400">{fmtNum(alert.d0Downloads)}</td>
      <td className="text-center">
        <div className="flex gap-0.5 items-end justify-center h-6">
          {[alert.d2Downloads, alert.d1Downloads, alert.d0Downloads].map((v, i) => {
            const max = Math.max(alert.d2Downloads, alert.d1Downloads, alert.d0Downloads);
            const pct = max > 0 ? Math.round((v / max) * 100) : 0;
            return <div key={i} className="w-1.5 bg-[#6366f1] rounded-sm" style={{ height: `${pct}%` }} />;
          })}
        </div>
      </td>
      <td><TriggerBadge type={alert.triggerType} /></td>
    </tr>
  );
}

export function RecentAlertsTable() {
  const [alerts, setAlerts] = useState<AppTriggerAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AppStoreSpyService.getAlerts({ limit: 50, page: 1 })
      .then((res) => {
        const allAlerts = res.data;
        // Group by trigger type
        const nt1Args = allAlerts.filter(a => a.triggerType === 'NT1');
        const nt2Args = allAlerts.filter(a => a.triggerType === 'NT2');
        const nt3Args = allAlerts.filter(a => a.triggerType === 'NT3');

        // We want 3 of each
        const result: AppTriggerAlert[] = [];
        const needed = { NT1: 3, NT2: 3, NT3: 3 };

        // Take up to 3 for each
        result.push(...nt1Args.splice(0, needed.NT1));
        result.push(...nt2Args.splice(0, needed.NT2));
        result.push(...nt3Args.splice(0, needed.NT3));

        // Update needed counts based on what we actually got
        needed.NT1 -= result.filter(a => a.triggerType === 'NT1').length;
        needed.NT2 -= result.filter(a => a.triggerType === 'NT2').length;
        needed.NT3 -= result.filter(a => a.triggerType === 'NT3').length;

        const totalNeeded = needed.NT1 + needed.NT2 + needed.NT3;

        // If we still need more to reach 9 total, fill from remaining
        if (totalNeeded > 0) {
          let remaining = [...nt1Args, ...nt2Args, ...nt3Args].sort(
            (a, b) => new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime()
          );
          result.push(...remaining.slice(0, totalNeeded));
        }

        // Final sort desc by time for display
        result.sort((a, b) => new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime());
        setAlerts(result);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lg:col-span-2 glass-card rounded-2xl p-6 animate-in animate-in-delay-2">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#f59e0b]" />
          App tăng trưởng gần đây
        </h3>
        <Link href="/app-tracking" className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors flex items-center gap-1">
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-[#6366f1] animate-spin" /></div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#475569]">
          <TrendingUp className="w-8 h-8 opacity-30" />
          <p className="text-sm">Chưa có trigger alert nào. Chạy crawl để có dữ liệu.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748b] text-left border-b border-[#334155]">
                <th className="pb-3 font-medium">App</th>
                <th className="pb-3 font-medium text-right">D-2</th>
                <th className="pb-3 font-medium text-right">D-1</th>
                <th className="pb-3 font-medium text-right">D0</th>
                <th className="pb-3 font-medium text-center">Trend</th>
                <th className="pb-3 font-medium">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {alerts.map((a) => <AlertRow key={a.id} alert={a} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
