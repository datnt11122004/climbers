import { HttpClient } from './http';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackedApp = {
  id: number;
  appId: string;
  store: 'PLAY' | 'IOS';
  name: string;
  category: string | null;
  icon: string | null;
  releaseDate: string | null;
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
  rawResponse?: any;
  createdAt: string;
  trackedApp?: Pick<TrackedApp, 'appId' | 'name' | 'store'>;
};

export type AppTriggerAlert = {
  id: number;
  trackedAppId: number;
  triggerDate: string;
  triggerType: 'NT1' | 'NT2' | 'NT3';
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

export type TrackedAppWithData = TrackedApp & {
  dailyData: AppDailyData[];
  triggerAlerts: AppTriggerAlert[];
};

export type TelegramBot = {
  id: number;
  name: string;
  active: boolean;
  interactive: boolean;
  createdAt: string;
};

export type TelegramGroupConfig = {
  id: number;
  botId: number;
  chatId: string;
  topicId: number | null;
  groupName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  bot?: Pick<TelegramBot, 'id' | 'name' | 'active'>;
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
  triggerType?: 'NT1' | 'NT2' | 'NT3';
  trackedAppId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type AppsQuery = {
  category?: string;
  triggerType?: 'NT1' | 'NT2' | 'NT3' | '';
  search?: string;
  triggeredOnly?: boolean;
  sortBy?: 'downloads' | 'releaseDate' | 'createdAt' | 'category' | 'triggerDate';
  sortDir?: 'asc' | 'desc';
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

  /** Add a new app to track by Play Store URL or bundle ID */
  static async addTrackedApp(payload: { url?: string; bundleId?: string }): Promise<TrackedApp & { message: string }> {
    const res = await HttpClient.post<ApiSingleResponse<TrackedApp & { message: string }>>('/appstorespy/track-app', payload);
    return res.data;
  }

  /** User-accessible: Get paginated apps with sparkline + trigger alerts */
  static async getApps(query: AppsQuery = {}): Promise<ApiListResponse<TrackedAppWithData>> {
    const params: Record<string, string> = {};
    if (query.category) params.category = query.category;
    if (query.triggerType) params.triggerType = query.triggerType;
    if (query.search) params.search = query.search;
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    if (query.triggeredOnly !== undefined) params.triggeredOnly = String(query.triggeredOnly);
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortDir) params.sortDir = query.sortDir;
    return HttpClient.get<ApiListResponse<TrackedAppWithData>>('/appstorespy/apps', { params });
  }

  /** User-accessible: Get single app detail with 60-day daily chart data */
  static async getAppDetail(id: number): Promise<TrackedAppWithData> {
    const res = await HttpClient.get<ApiSingleResponse<TrackedAppWithData>>(`/appstorespy/apps/${id}`);
    return res.data;
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

  // ─── Telegram Config ────────────────────────────────────

  static async getBots(): Promise<TelegramBot[]> {
    const res = await HttpClient.get<ApiSingleResponse<TelegramBot[]>>('/appstorespy/bots');
    return res.data;
  }

  static async getTelegramConfigs(): Promise<TelegramGroupConfig[]> {
    const res = await HttpClient.get<ApiSingleResponse<TelegramGroupConfig[]>>('/appstorespy/telegram-configs');
    return res.data;
  }

  static async createTelegramConfig(data: {
    botId: number;
    chatId: string;
    topicId?: number;
    groupName?: string;
    active?: boolean;
  }): Promise<TelegramGroupConfig> {
    const res = await HttpClient.post<ApiSingleResponse<TelegramGroupConfig>>('/appstorespy/telegram-configs', data);
    return res.data;
  }

  static async updateTelegramConfig(
    id: number,
    data: Partial<{ botId: number; chatId: string; topicId: number; groupName: string; active: boolean }>
  ): Promise<TelegramGroupConfig> {
    const res = await HttpClient.patch<ApiSingleResponse<TelegramGroupConfig>>(`/appstorespy/telegram-configs/${id}`, data);
    return res.data;
  }

  static async deleteTelegramConfig(id: number): Promise<void> {
    await HttpClient.delete(`/appstorespy/telegram-configs/${id}`);
  }
}
