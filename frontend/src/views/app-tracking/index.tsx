import React from 'react';
import { Header } from '@/components/layout/Header';
import { Download, RefreshCw, Search, Table2, LayoutGrid, ExternalLink, Bookmark, Eye, Palette, ChevronLeft, ChevronRight } from 'lucide-react';

const trackings = [
  {
    id: 1,
    name: 'Remote Control Pro',
    url: 'play.google.com/rc-pro',
    category: 'Remote',
    categoryColor: 'blue',
    d2: '5,200',
    d1: '8,100',
    d0: '16,400',
    trigger: 'NT1',
    triggerColor: 'danger',
    version: 'v3.2.1',
    date: '25/02/2026',
    iconColor: 'from-blue-500 to-purple-500',
    abbr: 'RC'
  },
  {
    id: 2,
    name: 'Money Cash Reward',
    url: 'play.google.com/money-cash',
    category: 'Money',
    categoryColor: 'green',
    d2: '1,800',
    d1: '2,500',
    d0: '12,800',
    trigger: 'NT2',
    triggerColor: 'warning',
    version: 'v1.8.0',
    date: '24/02/2026',
    iconColor: 'from-green-500 to-emerald-500',
    abbr: 'MC'
  },
  {
    id: 3,
    name: 'Loan Calculator Plus',
    url: 'play.google.com/loan-calc',
    category: 'Loan',
    categoryColor: 'pink',
    d2: '6,100',
    d1: '9,500',
    d0: '19,200',
    trigger: 'NT1',
    triggerColor: 'danger',
    version: 'v2.5.3',
    date: '26/02/2026',
    iconColor: 'from-pink-500 to-rose-500',
    abbr: 'LN',
    bookmarked: true
  },
  {
    id: 4,
    name: 'VPN Shield Master',
    url: 'play.google.com/vpn-shield',
    category: 'VPN',
    categoryColor: 'cyan',
    d2: '7,300',
    d1: '11,000',
    d0: '22,500',
    trigger: 'NT1',
    triggerColor: 'danger',
    version: 'v4.1.2',
    date: '25/02/2026',
    iconColor: 'from-cyan-500 to-blue-500',
    abbr: 'VP'
  },
  {
    id: 5,
    name: 'PDF Scanner Elite',
    url: 'play.google.com/pdf-elite',
    category: 'PDF',
    categoryColor: 'orange',
    d2: '800',
    d1: '3,200',
    d0: '18,000',
    trigger: 'NT2',
    triggerColor: 'warning',
    version: 'v2.0.0',
    date: '26/02/2026',
    iconColor: 'from-orange-500 to-amber-500',
    abbr: 'PD'
  }
];

export default function AppTrackingView() {
  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-in">
        <Header title="Theo dõi App" description="Dashboard các app có lượt tải tăng trưởng mạnh" />
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#334155] text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-all border border-[#334155]">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#334155] text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-all border border-[#334155]">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-5 mb-6 animate-in animate-in-delay-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Dòng App</label>
            <select className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]">
              <option>Tất cả dòng</option>
              <option>Remote</option>
              <option>Money</option>
              <option>Loan</option>
              <option>PDF</option>
              <option>VPN</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
             <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Trigger Rule</label>
             <select className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]">
                <option>Tất cả</option>
                <option>NT1 - Đẩy đều</option>
                <option>NT2 - Vụt lên</option>
             </select>
          </div>
          <div className="flex-1 min-w-[180px]">
             <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Khoảng thời gian</label>
             <select className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]">
                <option>Hôm nay</option>
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
             </select>
          </div>
          <div className="flex-1 min-w-[150px]">
             <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Trạng thái</label>
             <select className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]">
                <option>Tất cả</option>
                <option>Đã lưu</option>
                <option>Chưa lưu</option>
             </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input type="text" placeholder="Tên app, URL..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#64748b] text-[#f1f5f9]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-in animate-in-delay-1">
        <button className="bg-gradient-to-r from-[#6366f1]/20 to-[#06b6d4]/10 border border-[#6366f1] text-[#e0e7ff] px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-[#6366f1]/10 shadow-lg">
          <Table2 className="w-4 h-4 inline mr-1" /> Bảng dữ liệu
        </button>
        <button className="px-4 py-2 rounded-xl text-sm font-medium text-[#94a3b8] border border-[#334155] hover:bg-[#334155] transition-all">
          <LayoutGrid className="w-4 h-4 inline mr-1" /> Dạng Card
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden animate-in animate-in-delay-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748b] text-left border-b border-[#334155] bg-[#0f172a]/50">
                <th className="px-6 py-4 font-medium"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-4 font-medium">App</th>
                <th className="px-4 py-4 font-medium">Dòng</th>
                <th className="px-4 py-4 font-medium text-right">D-2</th>
                <th className="px-4 py-4 font-medium text-right">D-1</th>
                <th className="px-4 py-4 font-medium text-right">D0</th>
                <th className="px-4 py-4 font-medium text-center">Trend</th>
                <th className="px-4 py-4 font-medium">Trigger</th>
                <th className="px-4 py-4 font-medium">Latest Update</th>
                <th className="px-4 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {trackings.map((app) => (
                <tr key={app.id} className="hover:bg-[#334155]/30 transition-colors">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-[#334155]" /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.iconColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{app.abbr}</div>
                      <div>
                        <p className="font-semibold">{app.name}</p>
                        <a href="#" className="text-xs text-[#818cf8] hover:underline flex items-center gap-1 mt-0.5">
                          <ExternalLink className="w-3 h-3" /> {app.url}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs bg-${app.categoryColor}-500/20 text-${app.categoryColor}-400 px-2.5 py-1 rounded-full font-medium`}>{app.category}</span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono">{app.d2}</td>
                  <td className="px-4 py-4 text-right font-mono">{app.d1}</td>
                  <td className="px-4 py-4 text-right font-mono font-semibold text-[#22c55e]">{app.d0}</td>
                  <td className="px-4 py-4">
                    <div className="sparkline gap-0.5 justify-center flex items-end h-8 h-[32px]">
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[30%]"></div>
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[45%]"></div>
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[40%]"></div>
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[55%]"></div>
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[65%]"></div>
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[80%]"></div>
                      <div className="w-1 bg-gradient-to-t from-[#6366f1] to-[#06b6d4] rounded-full h-[100%]"></div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs bg-${app.triggerColor}/20 text-${app.triggerColor} px-2.5 py-1 rounded-full font-bold`}>{app.trigger}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm">{app.version}</p>
                    <p className="text-xs text-[#64748b]">{app.date}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${app.bookmarked ? 'bg-[#6366f1] hover:bg-[#4f46e5]' : 'bg-[#6366f1]/20 hover:bg-[#6366f1]/30'}`} title="Lưu vào watchlist">
                        <Bookmark className={`w-4 h-4 ${app.bookmarked ? 'text-white fill-white' : 'text-[#818cf8]'}`} />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#06b6d4]/20 flex items-center justify-center hover:bg-[#06b6d4]/30 transition-colors" title="Appstore Spy">
                        <Eye className="w-4 h-4 text-[#06b6d4]" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center hover:bg-[#f59e0b]/30 transition-colors" title="Download Creative">
                        <Palette className="w-4 h-4 text-[#f59e0b]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-5 border-t border-[#334155] flex items-center justify-between">
          <p className="text-sm text-[#94a3b8]">Hiển thị <span className="font-semibold text-[#f1f5f9]">1-5</span> / <span className="font-semibold text-[#f1f5f9]">47</span> apps</p>
           <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all">
                  <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-[#6366f1] text-white flex items-center justify-center text-sm font-medium shadow-[#6366f1]/20 shadow-lg">1</button>
              <button className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all">2</button>
              <button className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all">3</button>
              <span className="text-[#64748b] px-1">...</span>
              <button className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all">7</button>
              <button className="w-9 h-9 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all">
                  <ChevronRight className="w-4 h-4" />
              </button>
          </div>
        </div>
      </div>
    </>
  );
}
