import React from 'react';

import { Header } from '@/components/layout/Header';
import { Layers, TrendingUp, Store, BellRing, Flame, ArrowRight, Sparkles, Zap, Eye, Settings, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardView() {
  return (
    <>
      <Header title="Dashboard" description="Tổng quan hệ thống nghiên cứu thị trường" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card glass-card rounded-2xl p-6 transition-all duration-300 animate-in animate-in-delay-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-[#818cf8]" />
            </div>
            <span className="text-xs font-medium text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-full">+2 mới</span>
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-[#94a3b8] mt-1">Dòng đang theo dõi</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-6 transition-all duration-300 animate-in animate-in-delay-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <span className="text-xs font-medium text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-full">+5 hôm nay</span>
          </div>
          <p className="text-3xl font-bold">47</p>
          <p className="text-sm text-[#94a3b8] mt-1">App đang tracking</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-6 transition-all duration-300 animate-in animate-in-delay-3">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <span className="text-xs font-medium text-[#64748b] bg-[#334155] px-2 py-1 rounded-full">Ổn định</span>
          </div>
          <p className="text-3xl font-bold">8</p>
          <p className="text-sm text-[#94a3b8] mt-1">Chợ theo dõi</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-6 transition-all duration-300 animate-in animate-in-delay-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
              <BellRing className="w-6 h-6 text-[#ef4444]" />
            </div>
            <span className="text-xs font-medium text-[#ef4444] bg-[#ef4444]/10 px-2 py-1 rounded-full">Quan trọng</span>
          </div>
          <p className="text-3xl font-bold">15</p>
          <p className="text-sm text-[#94a3b8] mt-1">Thông báo hôm nay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 animate-in animate-in-delay-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#f59e0b]" />
              App tăng trưởng gần đây
            </h3>
            <Link href="/app-tracking" className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#64748b] text-left border-b border-[#334155]">
                  <th className="pb-3 font-medium">App</th>
                  <th className="pb-3 font-medium">Dòng</th>
                  <th className="pb-3 font-medium text-right">D-2</th>
                  <th className="pb-3 font-medium text-right">D-1</th>
                  <th className="pb-3 font-medium text-right">D0</th>
                  <th className="pb-3 font-medium text-center">Trend</th>
                  <th className="pb-3 font-medium">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                <tr className="hover:bg-[#334155]/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">RC</div>
                      <div>
                        <p className="font-medium">Remote Control Pro</p>
                        <p className="text-xs text-[#64748b]">v3.2.1 • 25/02</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-xs bg-[#6366f1]/20 text-[#818cf8] px-2 py-0.5 rounded-full">Remote</span></td>
                  <td className="text-right font-mono">5,200</td>
                  <td className="text-right font-mono">8,100</td>
                  <td className="text-right font-mono font-semibold text-[#22c55e]">16,400</td>
                  <td className="text-center">
                    <div className="sparkline gap-1 justify-center">
                      <div className="sparkline-bar h-1/3"></div>
                      <div className="sparkline-bar h-1/2"></div>
                      <div className="sparkline-bar h-full"></div>
                    </div>
                  </td>
                  <td><span className="text-xs bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded-full font-semibold">NT1</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-in animate-in-delay-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#06b6d4]" />
              App mới trên Chợ
            </h3>
            <Link href="/store-monitoring" className="text-sm text-[#818cf8] hover:text-[#a5b4fc] transition-colors flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-[#334155] hover:border-[#6366f1]/30 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Smart File Manager</p>
                  <p className="text-xs text-[#64748b] mt-0.5">AppVN Store</p>
                </div>
              </div>
              <p className="text-xs text-[#64748b] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 5 phút trước
              </p>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
