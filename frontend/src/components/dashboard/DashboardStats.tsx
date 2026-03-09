'use client';

import { useEffect, useState } from 'react';
import { AppStoreSpyService } from '@/services/appstorespy.service';
import { Layers, TrendingUp, BellRing, Activity } from 'lucide-react';

type Stats = {
  trackedApps: number;
  totalAlerts: number;
  nt1Count: number;
  nt2Count: number;
};

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      AppStoreSpyService.getTrackedApps(),
      AppStoreSpyService.getAlerts({ limit: 1, page: 1 }),
      AppStoreSpyService.getAlerts({ triggerType: 'NT1', limit: 1, page: 1 }),
      AppStoreSpyService.getAlerts({ triggerType: 'NT2', limit: 1, page: 1 }),
    ]).then(([apps, allAlerts, nt1, nt2]) => {
      setStats({
        trackedApps: apps.length,
        totalAlerts: allAlerts.meta.total,
        nt1Count: nt1.meta.total,
        nt2Count: nt2.meta.total,
      });
    });
  }, []);

  const items = [
    {
      icon: <Layers className="w-6 h-6 text-[#818cf8]" />,
      bg: 'bg-[#6366f1]/20',
      value: stats?.trackedApps ?? '—',
      label: 'App đang tracking',
      badge: null,
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#06b6d4]" />,
      bg: 'bg-[#06b6d4]/20',
      value: stats?.totalAlerts ?? '—',
      label: 'Tổng trigger alerts',
      badge: null,
    },
    {
      icon: <BellRing className="w-6 h-6 text-[#818cf8]" />,
      bg: 'bg-violet-500/20',
      value: stats?.nt1Count ?? '—',
      label: 'NT1 (Ổn định mạnh)',
      badge: { text: 'NT1', cls: 'text-violet-400 bg-violet-500/10' },
    },
    {
      icon: <Activity className="w-6 h-6 text-[#f59e0b]" />,
      bg: 'bg-[#f59e0b]/20',
      value: stats?.nt2Count ?? '—',
      label: 'NT2 (Đột biến)',
      badge: { text: 'NT2', cls: 'text-orange-400 bg-orange-500/10' },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item, i) => (
        <div key={i} className={`stat-card glass-card rounded-2xl p-6 transition-all duration-300 animate-in animate-in-delay-${i + 1}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
              {item.icon}
            </div>
            {item.badge && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.badge.cls}`}>{item.badge.text}</span>
            )}
          </div>
          <p className="text-3xl font-bold">{item.value}</p>
          <p className="text-sm text-[#94a3b8] mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
