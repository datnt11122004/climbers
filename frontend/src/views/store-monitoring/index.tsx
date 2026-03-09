'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TrackedAppsTab } from '@/components/store-monitoring/TrackedAppsTab';
import { DailyDataTab } from '@/components/store-monitoring/DailyDataTab';
import { AlertsTab } from '@/components/store-monitoring/AlertsTab';
import { CrawlLogsTab } from '@/components/store-monitoring/CrawlLogsTab';
import { AppStoreSpyService } from '@/services/appstorespy.service';
import { List, BarChart2, Bell, Activity, CheckCircle2 } from 'lucide-react';

type Tab = 'apps' | 'data' | 'alerts' | 'logs';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'apps',   label: 'Tracked Apps',    icon: <List    className="w-4 h-4" /> },
  { id: 'data',   label: 'Daily Data',      icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'alerts', label: 'Trigger Alerts',  icon: <Bell    className="w-4 h-4" /> },
  { id: 'logs',   label: 'Crawl Logs',      icon: <Activity className="w-4 h-4" /> },
];

export default function StoreMonitoringView() {
  const [activeTab, setActiveTab] = useState<Tab>('apps');
  const [toast, setToast] = useState<string | null>(null);

  const handleCrawlTrigger = async () => {
    const res = await AppStoreSpyService.triggerCrawl();
    setToast(res.message);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <>
      <Header
        title="AppStoreSpy Monitor"
        description="Theo dõi daily install, trigger alert NT1/NT2 cho Google Play apps"
      />

      {/* Toast */}
      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-[#1e293b] rounded-xl border border-[#334155] mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#6366f1] text-white shadow-lg'
                : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'apps'   && <TrackedAppsTab />}
      {activeTab === 'data'   && <DailyDataTab />}
      {activeTab === 'alerts' && <AlertsTab />}
      {activeTab === 'logs'   && <CrawlLogsTab onCrawlTrigger={handleCrawlTrigger} />}
    </>
  );
}
