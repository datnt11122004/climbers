import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '#root/prisma/prisma.service';
import { AppStoreSpyService } from './appstorespy.service';
import { AppStoreSpyTriggerService } from './appstorespy-trigger.service';
import { Store } from '@prisma/client';

/**
 * Crawl service: runs every 6 hours to fetch daily install data
 * from AppStoreSpy for top apps dynamically.
 */
@Injectable()
export class AppStoreSpyCrawlService {
	private readonly logger = new Logger(AppStoreSpyCrawlService.name);
	// Maximum number of pages to crawl from search API (limit 100 per page)
	private readonly MAX_PAGES = 10;

	constructor(
		private readonly prisma: PrismaService,
		private readonly appStoreSpyService: AppStoreSpyService,
		private readonly triggerService: AppStoreSpyTriggerService,
	) {}

	/**
	 * Scheduled crawl job - runs every 6 hours (0:00, 6:00, 12:00, 18:00)
	 */
	@Cron('0 */6 * * *')
	async handleCrawl() {
		this.logger.log('🕷️ Starting scheduled AppStoreSpy crawl...');
		await this.executeCrawl();
	}

	/**
	 * Manual trigger for crawl (callable from controller)
	 */
	async executeCrawl() {
		const crawlLog = await this.prisma.crawlLog.create({
			data: { status: 'RUNNING' },
		});

		try {
			let processedCount = 0;
			let totalAppsFound = 0;
			const errors: string[] = [];

			// Crawl Google Play top apps using POST /play/apps/query
			// Filter: downloads_daily >= 2000, sort: release_date desc
			this.logger.log(`Fetching apps from AppStoreSpy Query API (downloads_daily >= 2000)...`);

			for (let page = 1; page <= this.MAX_PAGES; page++) {
				const apps = await this.appStoreSpyService.queryPlayApps(page, 100);

				if (!apps || !apps.length) {
					this.logger.log(`No more apps found on page ${page}. Stopping.`);
					break;
				}

				totalAppsFound += apps.length;
				this.logger.log(`Processing page ${page}/${this.MAX_PAGES} — ${apps.length} apps found`);

				for (const app of apps) {
					try {
						const bundleId = app.id; // query API returns `id` (bundle id)

						// 1. Upsert TrackedApp in DB
						const trackedApp = await this.prisma.trackedApp.upsert({
							where: {
								appId_store: { appId: bundleId, store: Store.PLAY },
							},
							update: {
								name: app.name || bundleId,
								category: app.category || null,
								icon: app.icon || null,
								active: true,
							},
							create: {
								appId: bundleId,
								store: Store.PLAY,
								name: app.name || bundleId,
								category: app.category || null,
								icon: app.icon || null,
								active: true,
							},
						});

						// 2. Fetch & save daily installs
						await this.crawlAppData(trackedApp, app);
						processedCount++;

						// Throttle to avoid rate limit
						await new Promise(resolve => setTimeout(resolve, 300));
					} catch (error) {
						const msg = `Error crawling ${app.id}: ${error?.message || error}`;
						this.logger.error(msg);
						errors.push(msg);
					}
				}
			}

			// Update crawl log
			await this.prisma.crawlLog.update({
				where: { id: crawlLog.id },
				data: {
					status: 'SUCCESS',
					totalApps: totalAppsFound,
					finishedAt: new Date(),
					processedApps: processedCount,
					errors: errors.length > 0 ? errors.join('\n') : null,
				},
			});

			this.logger.log(`✅ Crawl finished: ${processedCount}/${totalAppsFound} apps processed`);

			// Run trigger logic after crawl
			await this.triggerService.evaluateAllTriggers();
		} catch (error) {
			await this.prisma.crawlLog.update({
				where: { id: crawlLog.id },
				data: {
					status: 'FAILED',
					finishedAt: new Date(),
					errors: error?.message || 'Unknown error',
				},
			});
			this.logger.error('❌ Crawl failed:', error?.message);
		}

		return crawlLog;
	}

	/**
	 * Crawl daily data for a single app
	 */
	private async crawlAppData(
		appRecord: { id: number; appId: string; store: Store },
		searchDataRef?: any
	) {
		const today = new Date();
		const threeDaysAgo = new Date(today);
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		const startDate = this.formatDate(threeDaysAgo);
		const endDate = this.formatDate(today);

		if (appRecord.store === 'PLAY') {
			// Fetch daily installs from Google Play API `/play/apps/{id}/installs_daily`
			const dailyData = await this.appStoreSpyService.getPlayDailyInstalls(
				appRecord.appId,
				startDate,
				endDate,
			);

			if (!dailyData || dailyData.length === 0) {
				return;
			}

			for (const entry of dailyData) {
				const entryDate = new Date(entry.date);

				await this.prisma.appDailyData.upsert({
					where: {
						trackedAppId_date: {
							trackedAppId: appRecord.id,
							date: entryDate,
						},
					},
					update: {
						downloads: entry.ipd || entry.installs || 0,
					},
					create: {
						trackedAppId: appRecord.id,
						date: entryDate,
						downloads: entry.ipd || entry.installs || 0,
						revenue: 0,
						ratingCount: searchDataRef?.rating_count ?? null,
						ratingValue: searchDataRef?.rating_value ?? null,
						version: searchDataRef?.version ?? null,
						updatedDate: searchDataRef?.updated ? new Date(searchDataRef.updated) : null,
					},
				});
			}
		}
	}

	private formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	}
}
