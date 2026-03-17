import {
    Controller,
    Get,
    Post,
    Patch,
    Query,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
    Delete,
    BadRequestException,
    Logger
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';
import { UserRole, Store } from '@prisma/client';
import { AppStoreSpyCrawlService } from './appstorespy-crawl.service';
import { AppStoreSpyService as AppStoreSpyApiService } from './appstorespy.service';
import { PrismaService } from '#root/prisma/prisma.service';
import { AppStoreSpyNotifyService } from './appstorespy-notify.service';
import {
    QueryDailyDataDto,
    QueryAlertsDto,
    CreateTelegramConfigDto,
    UpdateTelegramConfigDto,
    AddTrackedAppDto
} from './dto';
import { JwtAuthGuard, RolesGuard } from '#root/auth/guards';
import { Roles } from '#root/auth/decorators';
import { ApiResponse } from '#root/common/types';

@ApiTags('AppStoreSpy')
@Controller('appstorespy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppStoreSpyController {
    private readonly logger = new Logger(AppStoreSpyController.name);

    constructor(
        private readonly crawlService: AppStoreSpyCrawlService,
        private readonly apiService: AppStoreSpyApiService,
        private readonly prisma: PrismaService,
        private readonly notifyService: AppStoreSpyNotifyService
    ) {}

    // ─── Public (all authenticated users) ─────────────────

    /**
     * GET /appstorespy/apps
     * Supports: search, triggerType filter, triggeredOnly, sortBy, sortDir
     */
    @Get('apps')
    @ApiOperation({
        summary: 'Get list of tracked apps with latest daily data'
    })
    @ApiQuery({
        name: 'triggeredOnly',
        required: false,
        description: 'Only return apps with at least one trigger alert',
        type: Boolean
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        enum: ['downloads', 'releaseDate', 'createdAt'],
        description: 'Sort field'
    })
    @ApiQuery({ name: 'sortDir', required: false, enum: ['asc', 'desc'] })
    async getApps(
        @Query('category') category?: string,
        @Query('triggerType') triggerType?: string,
        @Query('search') search?: string,
        @Query('triggeredOnly') triggeredOnly?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortDir') sortDir?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '50'
    ) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
        const onlyTriggered = triggeredOnly !== 'false'; // default: true

        const where: any = { active: true };
        if (category)
            where.category = { contains: category, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { appId: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filter by trigger type or triggeredOnly
        if (triggerType) {
            const alertedApps = await this.prisma.appTriggerAlert.findMany({
                where: { triggerType: triggerType as any },
                select: { trackedAppId: true },
                distinct: ['trackedAppId']
            });
            where.id = { in: alertedApps.map((a) => a.trackedAppId) };
        } else if (onlyTriggered) {
            const alertedApps = await this.prisma.appTriggerAlert.findMany({
                select: { trackedAppId: true },
                distinct: ['trackedAppId']
            });
            where.id = { in: alertedApps.map((a) => a.trackedAppId) };
        }

        // Build orderBy
        let orderBy: any = { createdAt: 'desc' };
        const dir = sortDir === 'asc' ? 'asc' : 'desc';
        if (sortBy === 'releaseDate') orderBy = { releaseDate: dir };
        else if (sortBy === 'createdAt') orderBy = { createdAt: dir };
        // 'downloads' will be sorted application-side via dailyData (already fetched)

        const total = await this.prisma.trackedApp.count({ where });

        const apps = await this.prisma.trackedApp.findMany({
            where,
            orderBy,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            include: {
                dailyData: {
                    orderBy: { date: 'desc' },
                    take: 7
                },
                triggerAlerts: {
                    orderBy: { triggerDate: 'desc' },
                    take: 3
                }
            }
        });

        // If sortBy === 'downloads', sort by latest daily download count
        if (sortBy === 'downloads') {
            apps.sort((a, b) => {
                const aD = a.dailyData[0]?.downloads ?? 0;
                const bD = b.dailyData[0]?.downloads ?? 0;
                return dir === 'asc' ? aD - bD : bD - aD;
            });
        }

        return ApiResponse.list({
            data: apps,
            meta: { total, page: pageNum, limit: limitNum }
        });
    }

    /**
     * GET /appstorespy/apps/:id
     * Returns single app detail with 60 days of daily data
     */
    @Get('apps/:id')
    @ApiOperation({
        summary: 'Get single app detail with 60-day daily chart data'
    })
    async getAppDetail(@Param('id', ParseIntPipe) id: number) {
        const app = await this.prisma.trackedApp.findUnique({
            where: { id },
            include: {
                dailyData: {
                    orderBy: { date: 'asc' },
                    take: 60
                },
                triggerAlerts: {
                    orderBy: { triggerDate: 'desc' },
                    take: 10
                }
            }
        });

        if (!app) {
            return ApiResponse.Error(404);
        }

        return ApiResponse.OK(app);
    }

    // ─── Admin Only ────────────────────────────────────────

    @Post('crawl/trigger')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Manually trigger the AppStoreSpy daily crawl job (Admin)'
    })
    async triggerCrawl() {
        this.crawlService.executeCrawl();
        return ApiResponse.OK({ message: 'Crawl job started in background' });
    }

    @Get('crawl-logs')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'View recent crawl logs (Admin)' })
    async getCrawlLogs() {
        const logs = await this.prisma.crawlLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' }
        });
        return ApiResponse.OK(logs);
    }

    @Get('tracked-apps')
    @ApiOperation({ summary: 'Get raw list of tracked apps' })
    async getTrackedApps() {
        const apps = await this.prisma.trackedApp.findMany({
            orderBy: { createdAt: 'desc' },
            take: 500
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

    /**
     * POST /appstorespy/track-app
     * Add a new app to track by Play Store URL or bundle ID
     */
    @Post('track-app')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Add a new app to track by Play Store URL or Bundle ID (Admin)'
    })
    async addTrackedApp(@Body() dto: AddTrackedAppDto) {
        let bundleId: string | undefined;

        if (dto.url) {
            // Extract bundle ID from Play Store URL
            // e.g. https://play.google.com/store/apps/details?id=com.example.app
            const match = dto.url.match(/[?&]id=([^&]+)/);
            if (!match) {
                throw new BadRequestException(
                    'Cannot extract bundle ID from URL. Make sure it is a valid Google Play Store URL.'
                );
            }
            bundleId = match[1];
        } else if (dto.bundleId) {
            bundleId = dto.bundleId;
        } else {
            throw new BadRequestException(
                'Provide either a Play Store URL or a bundle ID.'
            );
        }

        // Fetch app info from AppStoreSpy
        const appInfo = await this.apiService.getPlayApp(bundleId);

        // Upsert TrackedApp
        const trackedApp = await this.prisma.trackedApp.upsert({
            where: { appId_store: { appId: bundleId, store: Store.PLAY } },
            update: {
                name: appInfo?.name || bundleId,
                category: appInfo?.category || null,
                icon: appInfo?.icon || null,
                ...(appInfo?.release_date && {
                    releaseDate: new Date(appInfo.release_date)
                }),
                active: true
            },
            create: {
                appId: bundleId,
                store: Store.PLAY,
                name: appInfo?.name || bundleId,
                category: appInfo?.category || null,
                icon: appInfo?.icon || null,
                ...(appInfo?.release_date && {
                    releaseDate: new Date(appInfo.release_date)
                }),
                active: true
            }
        });

        // Trigger background crawl for this app
        this.crawlService.crawlAppData(trackedApp, appInfo).catch(() => {});

        return ApiResponse.OK({
            ...trackedApp,
            message: 'App added to tracking and crawl started'
        });
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
            take: limit
        });

        return ApiResponse.list({ data, meta: { total, page, limit } });
    }

    @Get('alerts')
    @ApiOperation({ summary: 'Query app trigger alerts (NT1 / NT2 / NT3)' })
    async getAlerts(@Query() query: QueryAlertsDto) {
        const {
            triggerType,
            trackedAppId,
            from,
            to,
            page = 1,
            limit = 50
        } = query;

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
                trackedApp: {
                    select: { appId: true, name: true, icon: true, store: true }
                }
            },
            orderBy: { triggerDate: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        return ApiResponse.list({ data, meta: { total, page, limit } });
    }

    // ─── Telegram Config CRUD (Admin) ──────────────────────

    @Get('telegram-configs')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all Telegram group configurations (Admin)' })
    async getTelegramConfigs() {
        const configs = await this.prisma.telegramGroupConfig.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                bot: {
                    select: {
                        id: true,
                        name: true,
                        active: true,
                        interactive: true
                    }
                }
            }
        });
        return ApiResponse.OK(configs);
    }

    @Post('telegram-configs')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new Telegram group config (Admin)' })
    async createTelegramConfig(@Body() dto: CreateTelegramConfigDto) {
        const config = await this.prisma.telegramGroupConfig.create({
            data: {
                botId: dto.botId,
                chatId: dto.chatId,
                topicId: dto.topicId ?? null,
                groupName: dto.groupName ?? null,
                active: dto.active ?? true
            },
            include: { bot: { select: { id: true, name: true, active: true } } }
        });
        return ApiResponse.OK(config);
    }

    @Patch('telegram-configs/:id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a Telegram group config (Admin)' })
    async updateTelegramConfig(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTelegramConfigDto
    ) {
        const config = await this.prisma.telegramGroupConfig.update({
            where: { id },
            data: {
                ...(dto.botId !== undefined && { botId: dto.botId }),
                ...(dto.chatId !== undefined && { chatId: dto.chatId }),
                ...(dto.topicId !== undefined && { topicId: dto.topicId }),
                ...(dto.groupName !== undefined && {
                    groupName: dto.groupName
                }),
                ...(dto.active !== undefined && { active: dto.active })
            },
            include: { bot: { select: { id: true, name: true, active: true } } }
        });
        return ApiResponse.OK(config);
    }

    @Delete('telegram-configs/:id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a Telegram group config (Admin)' })
    async deleteTelegramConfig(@Param('id', ParseIntPipe) id: number) {
        await this.prisma.telegramGroupConfig.delete({ where: { id } });
        return ApiResponse.OK({ message: 'Config deleted' });
    }

    @Post('telegram-configs/:id/test')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Send a test message to a Telegram group config (Admin)'
    })
    async testTelegramConfig(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.notifyService.sendTestMessage(id);
            return ApiResponse.OK({
                message: 'Test message sent successfully'
            });
        } catch (error) {
            this.logger.error(`Failed to send test message: ${error.message}`);
            return ApiResponse.Error(500).withMessage(error.message);
        }
    }

    // ─── Bots listing for UI (Admin) ─────────────────────

    @Get('bots')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all bots (Admin)' })
    async getBots() {
        const bots = await this.prisma.bot.findMany({
            orderBy: { id: 'asc' },
            select: {
                id: true,
                name: true,
                active: true,
                interactive: true,
                createdAt: true
            }
        });
        return ApiResponse.OK(bots);
    }
}
