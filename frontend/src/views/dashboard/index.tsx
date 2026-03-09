'use client';

import { Header } from '@/components/layout/Header';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentAlertsTable } from '@/components/dashboard/RecentAlertsTable';
import { NewAppsPanel } from '@/components/dashboard/NewAppsPanel';

export default function DashboardView() {
  return (
    <>
      <Header title="Dashboard" description="Tổng quan hệ thống nghiên cứu thị trường" />

      {/* Real-time stat cards */}
      <DashboardStats />

      {/* Main grid: alerts table + newest apps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentAlertsTable />
        <NewAppsPanel />
      </div>
    </>
  );
}
