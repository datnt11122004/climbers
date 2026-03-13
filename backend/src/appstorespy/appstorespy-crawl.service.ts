import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '#root/prisma/prisma.service';
import { AppStoreSpyService } from './appstorespy.service';
import { AppStoreSpyTriggerService } from './appstorespy-trigger.service';
import { Store } from '@prisma/client';

/**
 * Crawl service: runs every 12 hours to fetch daily install data
 * from AppStoreSpy for top apps dynamically.
 * Crawls last 60 days (2 months) of data per app.
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
	 * Scheduled crawl job - runs every 12 hours (0:00, 12:00)
	 */
	@Cron('0 */12 * * *')
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

			// Crawl all active apps from the database
			this.logger.log(`Fetching active apps from database for daily crawl...`);

			const apps = await this.prisma.trackedApp.findMany({
				where: { active: true },
			});

			totalAppsFound = apps.length;
			this.logger.log(`Processing ${apps.length} active apps...`);

			for (const app of apps) {
				try {
					// Fetch & save daily installs
					await this.crawlAppData(app);
					processedCount++;

					// Throttle to avoid rate limit
					await new Promise(resolve => setTimeout(resolve, 300));
				} catch (error) {
					const msg = `Error crawling ${app.appId}: ${error?.message || error}`;
					this.logger.error(msg);
					errors.push(msg);
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
	 * Crawl daily data for a single app — fetches last 60 days (2 months)
	 */
	async crawlAppData(
		appRecord: { id: number; appId: string; store: Store },
		searchDataRef?: any
	) {
		const today = new Date();
		const twoMonthsAgo = new Date(today);
		twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

		const startDate = this.formatDate(twoMonthsAgo);
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
						downloads: entry.installs || 0,
						rawResponse: entry as any,
					},
					create: {
						trackedAppId: appRecord.id,
						date: entryDate,
						downloads: entry.installs || 0,
						revenue: 0,
						ratingCount: searchDataRef?.rating_count ?? null,
						ratingValue: searchDataRef?.rating_value ?? null,
						version: searchDataRef?.version ?? null,
						updatedDate: searchDataRef?.updated ? new Date(searchDataRef.updated) : null,
						rawResponse: entry as any,
					},
				});
			}
		}
	}

	private formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	}
}
