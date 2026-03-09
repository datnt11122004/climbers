import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '#root/prisma/prisma.service';

/**
 * Trigger service: evaluates NT1/NT2 logic after crawl completes.
 *
 * NT1 Logic:
 *   - D-2 >= 5,000 downloads
 *   - D-1 >= 1.5 × D-2
 *   - D0 >= 2 × D-1
 *
 * NT2 Logic:
 *   - D-1 >= 2K
 *   - D0 >= 5 × D-1
 */
@Injectable()
export class AppStoreSpyTriggerService {
	private readonly logger = new Logger(AppStoreSpyTriggerService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Evaluate all triggers for all active tracked apps
	 */
	async evaluateAllTriggers() {
		this.logger.log('🔍 Evaluating triggers for all tracked apps...');

		const trackedApps = await this.prisma.trackedApp.findMany({
			where: { active: true },
		});

		let alertCount = 0;

		for (const app of trackedApps) {
			try {
				const alerts = await this.evaluateAppTriggers(app.id);
				alertCount += alerts;
			} catch (error) {
				this.logger.error(`Failed to evaluate triggers for app ${app.appId}: ${error?.message}`);
			}
		}

		this.logger.log(`✅ Trigger evaluation complete: ${alertCount} new alerts created`);
		return alertCount;
	}

	/**
	 * Evaluate triggers for a single app
	 */
	private async evaluateAppTriggers(trackedAppId: number): Promise<number> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Get last 3 days of data (D-2, D-1, D0)
		const threeDaysAgo = new Date(today);
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);

		const dailyData = await this.prisma.appDailyData.findMany({
			where: {
				trackedAppId,
				date: {
					gte: threeDaysAgo,
					lte: today,
				},
			},
			orderBy: { date: 'asc' },
		});

		if (dailyData.length < 3) {
			return 0; // Not enough data
		}

		// Map to D-2, D-1, D0
		const d2 = dailyData[dailyData.length - 3]; // D-2 (oldest)
		const d1 = dailyData[dailyData.length - 2]; // D-1
		const d0 = dailyData[dailyData.length - 1]; // D0 (newest / today)

		let alertsCreated = 0;

		// ─── NT1: Tăng trưởng ổn định mạnh ───────────────
		// D-2 >= 5K AND D-1 >= 1.5 × D-2 AND D0 >= 2 × D-1
		if (
			d2.downloads >= 5_000 &&
			d1.downloads >= 1.5 * d2.downloads &&
			d0.downloads >= 2 * d1.downloads
		) {
			const growthRate = d2.downloads > 0 ? d0.downloads / d2.downloads : 0;

			// Check if we already have this alert for today
			const existing = await this.prisma.appTriggerAlert.findFirst({
				where: {
					trackedAppId,
					triggerType: 'NT1',
					triggerDate: today,
				},
			});

			if (!existing) {
				await this.prisma.appTriggerAlert.create({
					data: {
						trackedAppId,
						triggerDate: today,
						triggerType: 'NT1',
						d0Downloads: d0.downloads,
						d1Downloads: d1.downloads,
						d2Downloads: d2.downloads,
						growthRate,
						notes: `NT1: Tăng trưởng ổn định. D-2=${d2.downloads}, D-1=${d1.downloads} (×${(d1.downloads / d2.downloads).toFixed(2)}), D0=${d0.downloads}`,
					},
				});
				alertsCreated++;
				this.logger.log(`🚨 NT1 Alert for app #${trackedAppId}: D-2=${d2.downloads}, D-1=${d1.downloads}, D0=${d0.downloads}`);
			}
		}

		// ─── NT2: Tăng trưởng đột biến ───────────────────
		// D-1 >= 2K AND D0 >= 5 × D-1
		if (
			d1.downloads >= 2_000 &&
			d0.downloads >= 5 * d1.downloads
		) {
			const growthRate = d2.downloads > 0 ? d0.downloads / d2.downloads : 0;

			const existing = await this.prisma.appTriggerAlert.findFirst({
				where: {
					trackedAppId,
					triggerType: 'NT2',
					triggerDate: today,
				},
			});

			if (!existing) {
				await this.prisma.appTriggerAlert.create({
					data: {
						trackedAppId,
						triggerDate: today,
						triggerType: 'NT2',
						d0Downloads: d0.downloads,
						d1Downloads: d1.downloads,
						d2Downloads: d2.downloads,
						growthRate,
						notes: `NT2: Tăng trưởng đột biến! D-2=${d2.downloads}, D-1=${d1.downloads} (×${(d1.downloads / d2.downloads).toFixed(2)}), D0=${d0.downloads} (×${(d0.downloads / d1.downloads).toFixed(2)})`,
					},
				});
				alertsCreated++;
				this.logger.log(`🔥 NT2 Alert for app #${trackedAppId}: D-2=${d2.downloads}, D-1=${d1.downloads}, D0=${d0.downloads}`);
			}
		}

		return alertsCreated;
	}
}
