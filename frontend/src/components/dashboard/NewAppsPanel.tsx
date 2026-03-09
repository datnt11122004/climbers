'use client';

import { useEffect, useState } from 'react';
import { AppStoreSpyService, TrackedApp } from '@/services/appstorespy.service';
import { Sparkles, ArrowRight, Play, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)} ngày trước`;
  if (h > 0) return `${h} giờ trước`;
  if (m > 0) return `${m} phút trước`;
  return 'Vừa xong';
}

function AppCard({ app }: { app: TrackedApp }) {
  return (
    <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#334155] hover:border-[#6366f1]/30 transition-all duration-200">
      <div className="flex items-center gap-3">
        {app.icon ? (
          <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Play className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{app.name}</p>
          <p className="text-xs text-[#64748b] truncate">{app.category || 'Google Play'}</p>
        </div>
      </div>
      <p className="text-xs text-[#64748b] mt-2 flex items-center gap-1">
        <Clock className="w-3 h-3 flex-shrink-0" />
        {timeAgo(app.createdAt)}
      </p>
    </div>
  );
}

export function NewAppsPanel() {
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AppStoreSpyService.getTrackedApps()
      .then((all) => {
        // Sort by createdAt desc, take 5 newest
        const sorted = [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApps(sorted.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-3">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#06b6d4]" />
          App mới được track
        </h3>
        <Link href="/store-monitoring" className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors flex items-center gap-1">
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-[#6366f1] animate-spin" /></div>
      ) : apps.length === 0 ? (
        <p className="text-sm text-center text-[#475569] py-8">Chưa có app nào</p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => <AppCard key={app.id} app={app} />)}
        </div>
      )}
    </div>
  );
}
