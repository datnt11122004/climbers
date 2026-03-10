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
export class AppStoreSpyController {
	constructor(
		private readonly crawlService: AppStoreSpyCrawlService,
		private readonly prisma: PrismaService,
	) {}

	// ─── Public (all authenticated users) ─────────────────

	/**
	 * GET /appstorespy/apps
	 * Returns tracked apps list with latest daily install — accessible to all users
	 */
	@Get('apps')
	@ApiOperation({ summary: 'Get list of tracked apps with latest daily data (all users)' })
	async getApps(
		@Query('category') category?: string,
		@Query('triggerType') triggerType?: string,
		@Query('search') search?: string,
		@Query('page') page = '1',
		@Query('limit') limit = '50',
	) {
		const pageNum = Math.max(1, parseInt(page, 10) || 1);
		const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

		const where: any = { active: true };
		if (category) where.category = { contains: category, mode: 'insensitive' };
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ appId: { contains: search, mode: 'insensitive' } },
			];
		}

		let appIds: number[] | undefined;
		if (triggerType) {
			const alertedApps = await this.prisma.appTriggerAlert.findMany({
				where: { triggerType: triggerType as any },
				select: { trackedAppId: true },
				distinct: ['trackedAppId'],
			});
			appIds = alertedApps.map((a) => a.trackedAppId);
			where.id = { in: appIds };
		}

		const total = await this.prisma.trackedApp.count({ where });

		const apps = await this.prisma.trackedApp.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			skip: (pageNum - 1) * limitNum,
			take: limitNum,
			include: {
				// Last 7 days for sparkline
				dailyData: {
					orderBy: { date: 'desc' },
					take: 7,
				},
				// Latest trigger alerts
				triggerAlerts: {
					orderBy: { triggerDate: 'desc' },
					take: 3,
				},
			},
		});

		return ApiResponse.list({ data: apps, meta: { total, page: pageNum, limit: limitNum } });
	}

	/**
	 * GET /appstorespy/apps/:id
	 * Returns single app detail with 60 days of daily data — accessible to all users
	 */
	@Get('apps/:id')
	@ApiOperation({ summary: 'Get single app detail with 60-day daily chart data (all users)' })
	async getAppDetail(@Param('id', ParseIntPipe) id: number) {
		const app = await this.prisma.trackedApp.findUnique({
			where: { id },
			include: {
				dailyData: {
					orderBy: { date: 'asc' },
					take: 60,
				},
				triggerAlerts: {
					orderBy: { triggerDate: 'desc' },
					take: 10,
				},
			},
		});

		if (!app) {
			return ApiResponse.Error(404);
		}

		return ApiResponse.OK(app);
	}

	// ─── Admin Only ────────────────────────────────────────

	@Post('crawl/trigger')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Manually trigger the AppStoreSpy daily crawl job (Admin)' })
	async triggerCrawl() {
		// Run in background so request doesn't timeout
		this.crawlService.executeCrawl();
		return ApiResponse.OK({ message: 'Crawl job started in background' });
	}

	@Get('crawl-logs')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'View recent crawl logs (Admin)' })
	async getCrawlLogs() {
		const logs = await this.prisma.crawlLog.findMany({
			take: 20,
			orderBy: { createdAt: 'desc' },
		});
		return ApiResponse.OK(logs);
	}

	@Get('tracked-apps')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Get raw list of tracked apps (Admin)' })
	async getTrackedApps() {
		const apps = await this.prisma.trackedApp.findMany({
			orderBy: { createdAt: 'desc' },
			take: 500,
		});
		return ApiResponse.OK(apps);
	}

	@Delete('tracked-apps/:id')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Delete a tracked app and its data (Admin)' })
	async removeTrackedApp(@Param('id', ParseIntPipe) id: number) {
		await this.prisma.trackedApp.delete({ where: { id } });
		return ApiResponse.OK({ message: 'App deleted' });
	}

	@Get('daily-data')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Query daily crawl data with filters (Admin)' })
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

	@Get('alerts')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Query app trigger alerts (NT1 / NT2 / NT3) (Admin)' })
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
