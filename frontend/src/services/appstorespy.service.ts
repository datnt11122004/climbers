import { HttpClient } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackedApp = {
  id: number;
  appId: string;
  store: 'PLAY' | 'IOS';
  name: string;
  category: string | null;
  icon: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppDailyData = {
  id: number;
  trackedAppId: number;
  date: string;
  downloads: number;
  revenue: number;
  ratingCount: number | null;
  ratingValue: number | null;
  version: string | null;
  updatedDate: string | null;
  createdAt: string;
  trackedApp?: Pick<TrackedApp, 'appId' | 'name' | 'store'>;
};

export type AppTriggerAlert = {
  id: number;
  trackedAppId: number;
  triggerDate: string;
  triggerType: 'NT1' | 'NT2';
  d0Downloads: number;
  d1Downloads: number;
  d2Downloads: number;
  growthRate: number;
  notes: string | null;
  createdAt: string;
  trackedApp?: Pick<TrackedApp, 'appId' | 'name' | 'icon' | 'store'>;
};

export type CrawlLog = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  totalApps: number;
  processedApps: number;
  errors: string | null;
  createdAt: string;
};

export type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number };
};

export type ApiSingleResponse<T> = {
  success: boolean;
  data: T;
};

export type DailyDataQuery = {
  trackedAppId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type AlertsQuery = {
  triggerType?: 'NT1' | 'NT2';
  trackedAppId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

// ─── Service ─────────────────────────────────────────────────────────────────

export class AppStoreSpyService {
  static async triggerCrawl(): Promise<{ message: string }> {
    const res = await HttpClient.post<ApiSingleResponse<{ message: string }>>('/appstorespy/crawl/trigger');
    return res.data;
  }

  static async getCrawlLogs(): Promise<CrawlLog[]> {
    const res = await HttpClient.get<ApiSingleResponse<CrawlLog[]>>('/appstorespy/crawl-logs');
    return res.data;
  }

  static async getTrackedApps(): Promise<TrackedApp[]> {
    const res = await HttpClient.get<ApiSingleResponse<TrackedApp[]>>('/appstorespy/tracked-apps');
    return res.data;
  }

  static async deleteTrackedApp(id: number): Promise<void> {
    await HttpClient.delete(`/appstorespy/tracked-apps/${id}`);
  }

  static async getDailyData(query: DailyDataQuery): Promise<ApiListResponse<AppDailyData>> {
    const params: Record<string, string> = {};
    if (query.trackedAppId) params.trackedAppId = String(query.trackedAppId);
    if (query.from) params.from = query.from;
    if (query.to) params.to = query.to;
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    return HttpClient.get<ApiListResponse<AppDailyData>>('/appstorespy/daily-data', { params });
  }

  static async getAlerts(query: AlertsQuery): Promise<ApiListResponse<AppTriggerAlert>> {
    const params: Record<string, string> = {};
    if (query.triggerType) params.triggerType = query.triggerType;
    if (query.trackedAppId) params.trackedAppId = String(query.trackedAppId);
    if (query.from) params.from = query.from;
    if (query.to) params.to = query.to;
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    return HttpClient.get<ApiListResponse<AppTriggerAlert>>('/appstorespy/alerts', { params });
  }
}
