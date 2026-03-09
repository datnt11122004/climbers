import { Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { APP_CONFIG } from '#root/config';
import { AppConfig } from '#root/config/env.schema';

/**
 * API client wrapper for AppStoreSpy API (https://api.appstorespy.com/v1)
 * Currently supports Google Play only.
 */
@Injectable()
export class AppStoreSpyService {
	private readonly logger = new Logger(AppStoreSpyService.name);
	private readonly client: AxiosInstance;

	constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
		this.client = axios.create({
			baseURL: 'https://api.appstorespy.com/v1',
			headers: {
				accept: 'application/json',
				'API-KEY': this.config.APPSTORESPY_API_KEY,
			},
			timeout: 30_000,
		});
	}

	// ─── Google Play ──────────────────────────────────────

	/** Get Google Play app details by bundle ID */
	async getPlayApp(bundleId: string, country = 'US') {
		try {
			const { data } = await this.client.get(`/play/apps/${bundleId}`, {
				params: { country },
			});
			return data;
		} catch (error) {
			this.logger.error(`Failed to fetch Play app: ${bundleId}`, error?.message);
			return null;
		}
	}

	/** Get Google Play app daily installs via /play/apps/{id}/installs_daily */
	async getPlayDailyInstalls(bundleId: string, start?: string, end?: string) {
		try {
			const { data } = await this.client.get(`/play/apps/${bundleId}/installs_daily`, {
				params: { start, end },
			});
			return data as Array<{ id: string; date: string; ipd: number; installs: number }>;
		} catch (error) {
			this.logger.error(`Failed to fetch Play daily installs: ${bundleId}`, error?.message);
			return [];
		}
	}

	/** Get Google Play app monthly estimates */
	async getPlayEstimates(bundleId: string, start?: string, end?: string) {
		try {
			const { data } = await this.client.get('/play/estimates', {
				params: { id: bundleId, start, end },
			});
			return data as Array<{ id: string; month: string; downloads: number; revenue: number }>;
		} catch (error) {
			this.logger.error(`Failed to fetch Play estimates: ${bundleId}`, error?.message);
			return [];
		}
	}

	/** Search Google Play apps by query (supports pagination) */
	async searchPlayApps(query: string, limit = 100, page = 1, sort = '-release_date') {
		try {
			const { data } = await this.client.get('/play/apps', {
				params: { q: query, limit, sort, page },
			});
			return data;
		} catch (error) {
			console.log(error);
			this.logger.error(`Failed to search Play apps: ${query}`, error?.message);
			return [];
		}
	}

	/**
	 * Query Google Play apps using POST /play/apps/query
	 * Supports filter: downloads_daily > 2000, sort by release_date
	 */
	async queryPlayApps(page = 1, limit = 100) {
		try {
			const body = {
				sort: "-release_date",
				fields: [
					"id",
					"name",
					"icon",
					"video",
					"downloads_mark",
					"category_type",
					"category",
					"url_appstorespy",
					"downloads_daily",
					"release_date"
				],
				language: "en_US",
				filter: {
					published: true,
					category_type: "APP",
					downloads_daily: { gte: 2000 }
				},
				limit,
				page
			};
			// Response shape: { data: AppItem[] }
			const res = await this.client.post('/play/apps/query', body);
			const items = res.data?.data ?? res.data ?? [];
			return items as Array<{
				id: string;
				name: string;
				icon: string | null;
				video: string | null;
				category: string;
				category_type: string;
				release_date: string;
				downloads_daily: number;
				downloads_mark: number;
				url_appstorespy: string;
			}>;
		} catch (error) {
			console.log(error);
			this.logger.error(`Failed to query Play apps (page ${page})`, error?.message);
			return [];
		}
	}
}
