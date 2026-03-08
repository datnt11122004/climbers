import React from 'react';
import { Header } from '@/components/layout/Header';
import { PlusCircle, Plus, UploadCloud, List, Store, Pause, Trash2, ChevronDown, Rss, RefreshCw, AppWindow, ExternalLink, Bookmark, Eye } from 'lucide-react';

const stores = [
  { id: 1, name: 'AppVN Store', url: 'appvn.com/store/dev-abc', iconColor: 'from-violet-500 to-purple-600' },
  { id: 2, name: '1Mobile Market', url: '1mobile.com/developer/xyz', iconColor: 'from-blue-500 to-indigo-600' },
  { id: 3, name: 'APKPure', url: 'apkpure.com/developer/def', iconColor: 'from-emerald-500 to-teal-600' },
  { id: 4, name: 'QooApp', url: 'qooapp.com/developer/ghi', iconColor: 'from-rose-500 to-pink-600' },
  { id: 5, name: 'Uptodown', url: 'uptodown.com/developer/jkl', iconColor: 'from-amber-500 to-orange-600' },
  { id: 6, name: 'APKMirror', url: 'apkmirror.com/developer/mno', iconColor: 'from-cyan-500 to-sky-600' }
];

const feedItems = [
  { id: 1, name: 'Smart File Manager Pro', store: 'AppVN Store', url: 'appvn.com/smart-file-manager-pro', time: '5 phút trước', isNew: true, iconColor: 'from-violet-500 to-purple-600', storeColor: 'text-violet-400 bg-violet-500/20' },
  { id: 2, name: 'Quick Cleaner 2026', store: '1Mobile Market', url: '1mobile.com/quick-cleaner-2026', time: '23 phút trước', isNew: true, iconColor: 'from-blue-500 to-indigo-600', storeColor: 'text-blue-400 bg-blue-500/20' },
  { id: 3, name: 'Weather Live Forecast', store: 'APKPure', url: 'apkpure.com/weather-live-forecast', time: '1 giờ trước', isNew: false, iconColor: 'from-emerald-500 to-teal-600', storeColor: 'text-emerald-400 bg-emerald-500/20' },
  { id: 4, name: 'Super VPN Unlimited', store: 'QooApp', url: 'qooapp.com/super-vpn-unlimited', time: '2 giờ trước', isNew: false, iconColor: 'from-rose-500 to-pink-600', storeColor: 'text-rose-400 bg-rose-500/20' },
  { id: 5, name: 'Battery Optimizer Max', store: 'Uptodown', url: 'uptodown.com/battery-optimizer-max', time: '3 giờ trước', isNew: false, iconColor: 'from-amber-500 to-orange-600', storeColor: 'text-amber-400 bg-amber-500/20' },
  { id: 6, name: 'Turbo Scanner Premium', store: 'APKMirror', url: 'apkmirror.com/turbo-scanner-premium', time: '5 giờ trước', isNew: false, iconColor: 'from-cyan-500 to-sky-600', storeColor: 'text-cyan-400 bg-cyan-500/20' },
  { id: 7, name: 'Remote Desktop Connect', store: 'AppVN Store', url: 'appvn.com/remote-desktop-connect', time: 'Hôm qua, 22:30', isNew: false, iconColor: 'from-fuchsia-500 to-purple-600', storeColor: 'text-violet-400 bg-violet-500/20' }
];

export default function StoreMonitoringView() {
  return (
    <>
      <div className="mb-8 animate-in">
        <Header title="Theo dõi Chợ" description="Quản lý các chợ ứng dụng đối thủ & phát hiện app mới release" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Store URL */}
          <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-1">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-5">
              <PlusCircle className="w-5 h-5 text-[#818cf8]" /> Thêm chợ theo dõi
            </h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Nhập URL chợ</label>
              <div className="flex gap-2">
                <input type="url" placeholder="https://store-example.com/developer/123" className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#64748b]" />
                <button className="px-4 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] shadow-[#6366f1]/20 shadow-lg text-sm font-medium text-white transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#334155]"></div>
              <span className="text-xs text-[#64748b]">hoặc</span>
              <div className="h-px flex-1 bg-[#334155]"></div>
            </div>

            {/* Drag Drop Zone */}
            <div className="border-2 border-dashed border-[#6366f1]/30 hover:border-[#6366f1] hover:bg-[#6366f1]/5 rounded-xl p-6 text-center cursor-pointer transition-all">
              <UploadCloud className="w-8 h-8 text-[#64748b] mx-auto mb-2" />
              <p className="text-sm text-[#94a3b8] mb-1">Kéo thả file hoặc <span className="text-[#818cf8] font-medium">chọn file</span></p>
              <p className="text-xs text-[#64748b]">Hỗ trợ .csv, .txt (1 URL mỗi dòng)</p>
            </div>
          </div>

          {/* Store List */}
          <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <List className="w-5 h-5 text-[#f59e0b]" /> Chợ đang theo dõi
              </h3>
              <span className="text-xs bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-1 rounded-full font-semibold">8 chợ</span>
            </div>
            
            <div className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a]/50 border border-[#334155] hover:border-[#6366f1]/30 transition-all group">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${store.iconColor} flex items-center justify-center text-white flex-shrink-0`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{store.name}</p>
                    <p className="text-xs text-[#64748b] truncate">{store.url}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded-lg hover:bg-[#334155] flex items-center justify-center transition-colors" title="Tạm dừng">
                      <Pause className="w-3.5 h-3.5 text-[#64748b]" />
                    </button>
                    <button className="w-7 h-7 rounded-lg hover:bg-[#ef4444]/20 flex items-center justify-center transition-colors" title="Xóa">
                      <Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full py-2.5 rounded-xl border border-[#334155] text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all flex items-center justify-center gap-1">
                Xem thêm 2 chợ <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Feed */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-2 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Rss className="w-5 h-5 text-[#22c55e]" /> App mới release trên chợ
              </h3>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]">
                  <option>Tất cả chợ</option>
                  <option>AppVN Store</option>
                  <option>1Mobile Market</option>
                  <option>APKPure</option>
                  <option>QooApp</option>
                  <option>Uptodown</option>
                </select>
                <button className="px-3 py-2 rounded-xl bg-[#334155] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors border border-[#334155]">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {feedItems.map((item) => (
                <div key={item.id} className={`p-4 rounded-xl transition-all border-l-4 ${item.isNew ? 'border-[#22c55e] bg-[#334155]/20' : 'border-transparent hover:border-[#6366f1] hover:bg-[#334155]/30'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.iconColor} flex items-center justify-center text-white flex-shrink-0`}>
                      <AppWindow className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.isNew && <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-semibold">MỚI</span>}
                        <span className="text-xs text-[#64748b]">{item.time}</span>
                      </div>
                      <p className="font-semibold text-base">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.storeColor}`}>{item.store}</span>
                      </div>
                      <a href="#" className="text-xs text-[#818cf8] hover:underline flex items-center gap-1 mt-2">
                        <ExternalLink className="w-3 h-3" /> https://{item.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                      <button className="w-8 h-8 rounded-lg bg-[#334155] flex items-center justify-center hover:bg-[#6366f1]/20 transition-colors" title="Theo dõi app này">
                        <Bookmark className="w-4 h-4 text-[#94a3b8]" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#334155] flex items-center justify-center hover:bg-[#06b6d4]/20 transition-colors" title="Xem trên Appstore Spy">
                        <Eye className="w-4 h-4 text-[#94a3b8]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <button className="px-6 py-2.5 rounded-xl border border-[#334155] text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all">
                Tải thêm <ChevronDown className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
