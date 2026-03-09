'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppStoreSpyService, TrackedApp } from '@/services/appstorespy.service';
import { Loader2, Play, RefreshCw, Trash2 } from 'lucide-react';

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function TrackedAppsTab() {
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setApps(await AppStoreSpyService.getTrackedApps()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa app này và toàn bộ data liên quan?')) return;
    setDeletingId(id);
    try {
      await AppStoreSpyService.deleteTrackedApp(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } finally { setDeletingId(null); }
  };

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.appId.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc bundle ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
        />
        <span className="text-xs text-[#64748b]">{filtered.length} apps</span>
        <button onClick={load} className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-[#6366f1] animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0f172a]">
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">App</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Bundle ID</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Category</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Status</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Tracked Since</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[#475569]">Không có dữ liệu</td></tr>
              ) : filtered.map((app) => (
                <tr key={app.id} className="border-b border-[#1e293b] hover:bg-[#0f172a]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {app.icon ? (
                        <img src={app.icon} alt={app.name} className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center">
                          <Play className="w-4 h-4 text-[#6366f1]" />
                        </div>
                      )}
                      <span className="font-medium text-[#f1f5f9] line-clamp-1 max-w-[180px]">{app.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8] font-mono text-xs">{app.appId}</td>
                  <td className="px-4 py-3 text-[#94a3b8] text-xs">{app.category || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${app.active ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#1e293b] text-[#64748b] border-[#334155]'}`}>
                      {app.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{fmtDate(app.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                      {deletingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
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
