'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Save, Eye, EyeOff, Send, BellRing, TrendingUp, Store, Calendar, AlertTriangle, Zap, History, CheckCircle, XCircle } from 'lucide-react';

const ToggleSwitch = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
  <div 
    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-[#6366f1]' : 'bg-[#475569]'}`}
    onClick={onChange}
  >
    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </div>
);

export default function NotificationsView() {
  const [showToken, setShowToken] = useState(false);
  const [toggles, setToggles] = useState({
    growth: true,
    newApp: true,
    dailyReport: false,
    systemAlert: true
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-in">
        <Header title="Cài đặt Thông báo" description="Cấu hình kết nối Telegram và trigger rules" />
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-sm font-semibold text-white hover:opacity-90 transition-all shadow-lg shadow-[#6366f1]/25">
          <Save className="w-4 h-4" /> Lưu cài đặt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Telegram Config */}
        <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-1">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#0088cc]/20 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0088cc">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            Kết nối Telegram
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
              <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse"></div>
              <span className="text-sm text-[#22c55e] font-medium">Đã kết nối thành công</span>
            </div>
            <div>
              <label className="text-sm font-medium text-[#94a3b8] mb-2 block">Bot Token</label>
              <div className="relative">
                <input type={showToken ? "text" : "password"} defaultValue="1234567890:ABCDefghijklmnopqrstUVWXYZ" className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono pr-12 text-[#f1f5f9]" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#f1f5f9] transition-colors" onClick={() => setShowToken(!showToken)}>
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#64748b] mt-1.5">Lấy token từ @BotFather trên Telegram</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#94a3b8] mb-2 block">Chat ID - UA Team</label>
              <input type="text" defaultValue="-1001234567890" className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-[#f1f5f9]" />
              <p className="text-xs text-[#64748b] mt-1.5">Group/Channel ID cho team UA</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#94a3b8] mb-2 block">Chat ID - Monetize Team</label>
              <input type="text" defaultValue="-1009876543210" className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-[#f1f5f9]" />
              <p className="text-xs text-[#64748b] mt-1.5">Group/Channel ID cho team Monetize</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0088cc]/20 text-[#0088cc] text-sm font-medium hover:bg-[#0088cc]/30 transition-colors">
              <Send className="w-4 h-4" /> Gửi tin nhắn test
            </button>
          </div>
        </div>

        {/* Notification Types */}
        <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-2">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <BellRing className="w-5 h-5 text-[#f59e0b]" /> Loại thông báo
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#334155]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">App tăng trưởng</p>
                    <p className="text-xs text-[#64748b]">Thông báo khi app đạt trigger NT1/NT2</p>
                  </div>
                </div>
                <ToggleSwitch active={toggles.growth} onChange={() => setToggles({...toggles, growth: !toggles.growth})} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-[#6366f1]/20 text-[#818cf8] px-2 py-1 rounded-lg">Gửi cho UA</span>
                <span className="text-xs bg-[#06b6d4]/20 text-[#06b6d4] px-2 py-1 rounded-lg">Gửi cho Monetize</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#334155]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#818cf8]/20 flex items-center justify-center">
                    <Store className="w-5 h-5 text-[#818cf8]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">App mới trên chợ</p>
                    <p className="text-xs text-[#64748b]">Thông báo khi phát hiện app mới release</p>
                  </div>
                </div>
                <ToggleSwitch active={toggles.newApp} onChange={() => setToggles({...toggles, newApp: !toggles.newApp})} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-[#6366f1]/20 text-[#818cf8] px-2 py-1 rounded-lg">Gửi cho UA</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#334155]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Báo cáo tổng hợp hàng ngày</p>
                    <p className="text-xs text-[#64748b]">Gửi summary vào 9:00 sáng mỗi ngày</p>
                  </div>
                </div>
                <ToggleSwitch active={toggles.dailyReport} onChange={() => setToggles({...toggles, dailyReport: !toggles.dailyReport})} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#334155]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Cảnh báo hệ thống</p>
                    <p className="text-xs text-[#64748b]">Lỗi crawl, mất kết nối, v.v.</p>
                  </div>
                </div>
                <ToggleSwitch active={toggles.systemAlert} onChange={() => setToggles({...toggles, systemAlert: !toggles.systemAlert})} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trigger Rules Configuration */}
        <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-2">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#f59e0b]" /> Cấu hình Trigger Rules
          </h3>
          <div className="space-y-6">
            {/* NT1 */}
            <div className="p-5 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold bg-[#ef4444]/20 text-[#ef4444] px-3 py-1 rounded-full">NT1</span>
                <span className="font-semibold">App đẩy đều - Tăng trưởng ổn định</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#64748b] mb-1.5 block">D-2 daily install tối thiểu</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue="5000" className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-[#f1f5f9]" />
                    <span className="text-xs text-[#64748b]">installs</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Hệ số D-1 so với D-2</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#94a3b8]">D-1 ≥</span>
                    <input type="number" defaultValue="1.5" step="0.1" className="w-24 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-center text-[#f1f5f9]" />
                    <span className="text-sm text-[#94a3b8]">× D-2</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Hệ số D0 so với D-1</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#94a3b8]">D0 ≥</span>
                    <input type="number" defaultValue="2" step="0.1" className="w-24 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-center text-[#f1f5f9]" />
                    <span className="text-sm text-[#94a3b8]">× D-1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NT2 */}
            <div className="p-5 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold bg-[#f59e0b]/20 text-[#f59e0b] px-3 py-1 rounded-full">NT2</span>
                <span className="font-semibold">App vụt lên - Tăng trưởng đột biến</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#64748b] mb-1.5 block">D-1 daily install tối thiểu</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue="2000" className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-[#f1f5f9]" />
                    <span className="text-xs text-[#64748b]">installs</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Hệ số D0 so với D-1</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#94a3b8]">D0 ≥</span>
                    <input type="number" defaultValue="5" step="0.5" className="w-24 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm focus:outline-none focus:border-[#6366f1] transition-colors font-mono text-center text-[#f1f5f9]" />
                    <span className="text-sm text-[#94a3b8]">× D-1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-3 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-[#94a3b8]" /> Lịch sử thông báo
            </h3>
            <select className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-[#334155] text-xs focus:outline-none focus:border-[#6366f1] transition-colors text-[#f1f5f9]">
              <option>Hôm nay</option>
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="space-y-1 overflow-y-auto pr-1 flex-1 max-h-[500px]">
            {/* Items */}
            <div className="p-3.5 rounded-xl flex items-start gap-3 hover:bg-[#334155]/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">App tăng trưởng: <span className="text-[#818cf8]">Remote Control Pro</span></p>
                <p className="text-xs text-[#64748b] mt-0.5">Trigger NT1 • Gửi cho UA Team</p>
                <p className="text-xs text-[#64748b] mt-0.5">23:15 - 26/02/2026</p>
              </div>
              <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full flex-shrink-0">Đã gửi</span>
            </div>

            <div className="p-3.5 rounded-xl flex items-start gap-3 hover:bg-[#334155]/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">App tăng trưởng: <span className="text-[#818cf8]">Money Cash Reward</span></p>
                <p className="text-xs text-[#64748b] mt-0.5">Trigger NT2 • Gửi cho UA + Monetize</p>
                <p className="text-xs text-[#64748b] mt-0.5">22:45 - 26/02/2026</p>
              </div>
              <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full flex-shrink-0">Đã gửi</span>
            </div>

            <div className="p-3.5 rounded-xl flex items-start gap-3 hover:bg-[#334155]/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 text-[#ef4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">App tăng trưởng: <span className="text-[#818cf8]">PDF Scanner Elite</span></p>
                <p className="text-xs text-[#64748b] mt-0.5">Trigger NT2 • Gửi cho Monetize</p>
                <p className="text-xs text-[#64748b] mt-0.5">20:15 - 26/02/2026</p>
              </div>
              <span className="text-xs bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded-full flex-shrink-0">Lỗi</span>
            </div>
            
            <div className="p-3.5 rounded-xl flex items-start gap-3 hover:bg-[#334155]/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">App mới trên chợ: <span className="text-[#06b6d4]">Smart File Manager</span></p>
                <p className="text-xs text-[#64748b] mt-0.5">AppVN Store • Gửi cho UA Team</p>
                <p className="text-xs text-[#64748b] mt-0.5">22:10 - 26/02/2026</p>
              </div>
              <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full flex-shrink-0">Đã gửi</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#334155] flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Tổng hôm nay: <span className="font-semibold text-[#f1f5f9]">15</span> thông báo</span>
            <span><span className="text-[#22c55e] font-semibold">14</span> thành công • <span className="text-[#ef4444] font-semibold">1</span> lỗi</span>
          </div>
        </div>
      </div>
    </>
  );
}
