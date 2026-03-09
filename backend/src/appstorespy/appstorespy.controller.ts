import { Controller, Get, Post, Query, Param, UseGuards, ParseIntPipe, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AppStoreSpyCrawlService } from './appstorespy-crawl.service';
import { PrismaService } from '#root/prisma/prisma.service';
import { QueryDailyDataDto, QueryAlertsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '#root/auth/guards';
import { Roles } from '#root/auth/decorators';
import { ApiResponse } from '#root/common/types';

@ApiTags('AppStoreSpy')
@Controller('appstorespy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Restrict AppStoreSpy features to Admin only
export class AppStoreSpyController {
	constructor(
		private readonly crawlService: AppStoreSpyCrawlService,
		private readonly prisma: PrismaService,
	) {}

	// ─── Manual Crawl Trigger ─────────────────────────────

	@Post('crawl/trigger')
	@ApiOperation({ summary: 'Manually trigger the AppStoreSpy daily crawl job' })
	async triggerCrawl() {
		// Run in background so request doesn't timeout
		this.crawlService.executeCrawl();
		return ApiResponse.OK({ message: 'Crawl job started in background' });
	}

	// ─── Crawl Logs ───────────────────────────────────────

	@Get('crawl-logs')
	@ApiOperation({ summary: 'View recent crawl logs' })
	async getCrawlLogs() {
		const logs = await this.prisma.crawlLog.findMany({
			take: 20,
			orderBy: { createdAt: 'desc' },
		});
		return ApiResponse.OK(logs);
	}

	// ─── Tracked Apps ─────────────────────────────────────

	@Get('tracked-apps')
	@ApiOperation({ summary: 'Get list of tracked apps from AppStoreSpy' })
	async getTrackedApps() {
		const apps = await this.prisma.trackedApp.findMany({
			orderBy: { createdAt: 'desc' },
			take: 500,
		});
		return ApiResponse.OK(apps);
	}

	@Delete('tracked-apps/:id')
	@ApiOperation({ summary: 'Delete a tracked app and its data' })
	async removeTrackedApp(@Param('id', ParseIntPipe) id: number) {
		await this.prisma.trackedApp.delete({ where: { id } });
		return ApiResponse.OK({ message: 'App deleted' });
	}

	// ─── App Daily Data ───────────────────────────────────

	@Get('daily-data')
	@ApiOperation({ summary: 'Query daily crawl data with filters' })
	async getDailyData(@Query() query: QueryDailyDataDto) {
		const { trackedAppId, from, to, page = 1, limit = 50 } = query;
		
		const where: any = {};
		if (trackedAppId) where.trackedAppId = trackedAppId;
		if (from || to) {
			where.date = {};
			if (from) where.date.gte = new Date(from);
			if (to) where.date.lte = new Date(to);
		}

		const total = await this.prisma.appDailyData.count({ where });
		
		const data = await this.prisma.appDailyData.findMany({
			where,
			include: {
				trackedApp: { select: { appId: true, name: true, store: true } }
			},
			orderBy: [{ date: 'desc' }, { downloads: 'desc' }],
			skip: (page - 1) * limit,
			take: limit,
		});

		return ApiResponse.list({ data, meta: { total, page, limit } });
	}

	// ─── App Trigger Alerts ───────────────────────────────

	@Get('alerts')
	@ApiOperation({ summary: 'Query app trigger alerts (NT1 / NT2)' })
	async getAlerts(@Query() query: QueryAlertsDto) {
		const { triggerType, trackedAppId, from, to, page = 1, limit = 50 } = query;

		const where: any = {};
		if (triggerType) where.triggerType = triggerType;
		if (trackedAppId) where.trackedAppId = trackedAppId;
		if (from || to) {
			where.triggerDate = {};
			if (from) where.triggerDate.gte = new Date(from);
			if (to) where.triggerDate.lte = new Date(to);
		}

		const total = await this.prisma.appTriggerAlert.count({ where });

		const data = await this.prisma.appTriggerAlert.findMany({
			where,
			include: {
				trackedApp: { select: { appId: true, name: true, icon: true, store: true } }
			},
			orderBy: { triggerDate: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		});

		return ApiResponse.list({ data, meta: { total, page, limit } });
	}
}
