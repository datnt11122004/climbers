import { Injectable, Logger } from '@nestjs/common';
import { BotManager } from '#root/bot/bot-manager';
import { PrismaService } from '#root/prisma/prisma.service';

/**
 * Notify service: sends Telegram messages when triggers fire.
 */
@Injectable()
export class AppStoreSpyNotifyService {
    private readonly logger = new Logger(AppStoreSpyNotifyService.name);

    constructor(private readonly prisma: PrismaService) {}

    private fmtNum(n: number): string {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return n.toLocaleString();
    }

    /**
     * Send a Telegram alert message to all active bots
     */
    async sendTriggerAlert(params: {
        triggerType: 'NT1' | 'NT2' | 'NT3';
        appName: string;
        appId: string;
        d0Downloads: number;
        d1Downloads: number;
        d2Downloads: number;
        growthRate: number;
        releaseDate?: Date | null;
    }) {
        const {
            triggerType,
            appName,
            appId,
            d0Downloads,
            d1Downloads,
            d2Downloads,
            growthRate,
            releaseDate
        } = params;

        let message = '';
        const playUrl = `https://play.google.com/store/apps/details?id=${appId}`;

        if (triggerType === 'NT3') {
            message = [
                `🚀 *NT3 – App mới release bùng nổ*`,
                ``,
                `🏪 Store: *Google Play*`,
                `📱 Tên app mới: *${appName}*`,
                `🔗 App URL: ${playUrl}`,
                releaseDate
                    ? `📅 Release: ${new Date(releaseDate).toLocaleDateString('vi-VN')}`
                    : '',
                ``,
                `📊 D-2: *${this.fmtNum(d2Downloads)}* → D-1: *${this.fmtNum(d1Downloads)}* → D0: *${this.fmtNum(d0Downloads)}*`,
                `#appstorespy #nt3`
            ]
                .filter((line) => line !== '')
                .join('\n');
        } else {
            let emoji = triggerType === 'NT1' ? '📈' : '🔥';
            let headerLine =
                triggerType === 'NT1'
                    ? '*NT1 – Tăng trưởng ổn định*'
                    : '*NT2 – Tăng trưởng đột biến*';
            message = [
                `${emoji} ${headerLine}`,
                ``,
                `📱 *${appName}*`,
                `🔗 \`${appId}\``,
                releaseDate
                    ? `📅 Release: ${new Date(releaseDate).toLocaleDateString('vi-VN')}`
                    : '',
                `📊 D-2: *${this.fmtNum(d2Downloads)}* → D-1: *${this.fmtNum(d1Downloads)}* → D0: *${this.fmtNum(d0Downloads)}*`,
                `📈 Growth rate: *×${growthRate.toFixed(2)}*`,
                ``,
                `#appstorespy #${triggerType.toLowerCase()}`
            ]
                .filter((line) => line !== '')
                .join('\n');
        }

        // 1. Fetch all active telegram group configurations for all bots
        const groupConfigs = await this.prisma.telegramGroupConfig.findMany({
            where: { active: true },
            include: { bot: true }
        });

        if (groupConfigs.length === 0) {
            this.logger.warn(
                'No active TelegramGroupConfig found in DB, skipping notification'
            );
            return;
        }

        // 2. Dispatch messages to configured chat groups/topics via matching bot
        for (const config of groupConfigs) {
            if (!config.bot?.active || !config.bot?.name) continue;

            // Find running bot instance that corresponds to this config
            const runningBot = BotManager.getBot(config.bot.name);
            if (!runningBot) {
                this.logger.debug(
                    `Bot ${config.bot.name} is configured but not running, skipping its messages`
                );
                continue;
            }

            try {
                const opts: any = { parse_mode: 'Markdown' };
                if (config.topicId) {
                    opts.message_thread_id = config.topicId;
                }

                await runningBot.api.sendMessage(config.chatId, message, opts);
                this.logger.log(
                    `📨 Sent ${triggerType} alert to Telegram config #${config.id} (Chat: ${config.chatId}, Topic: ${config.topicId || 'none'}) using bot ${config.bot.name}`
                );
            } catch (err: any) {
                this.logger.error(
                    `Failed to send Telegram alert to config #${config.id} (${config.chatId}) using bot ${config.bot.name}: ${err?.message}`
                );
            }
        }
    }

    /**
     * Send a test Telegram message to a specific configuration
     */
    async sendTestMessage(configId: number) {
        const config = await this.prisma.telegramGroupConfig.findUnique({
            where: { id: configId },
            include: { bot: true },
        });

        if (!config) throw new Error(`Configuration #${configId} not found`);
        if (!config.bot?.active || !config.bot?.name) throw new Error(`Bot for configuration #${configId} is inactive or not named`);

        const runningBot = BotManager.getBot(config.bot.name);
        if (!runningBot) throw new Error(`Bot ${config.bot.name} is not running`);

        const message = `🔔 *Test Notification*\n\nThis is a test message to verify the connection for configuration: *${config.groupName || config.chatId}*.\n\n✅ Bot: *${config.bot.name}*\n🚀 Status: *Success*`;

        const opts: any = { parse_mode: 'Markdown' };
        if (config.topicId) {
            opts.message_thread_id = config.topicId;
        }

        await runningBot.api.sendMessage(config.chatId, message, opts);
        this.logger.log(`📨 Sent test message to Telegram config #${config.id} (Chat: ${config.chatId}, Topic: ${config.topicId || 'none'}) using bot ${config.bot.name}`);
    }

    /**
     * Send a notification for a newly released app
     */
    async sendNewReleaseNotification(app: { name: string; appId: string; releaseDate?: Date | null }) {
        const playUrl = `https://play.google.com/store/apps/details?id=${app.appId}`;
        const message = [
            `🆕 *App vừa mới được release*`,
            ``,
            `📱 Tên app mới: *${app.name}*`,
            `🔗 App URL: ${playUrl}`,
            app.releaseDate ? `📅 Ngày release: ${new Date(app.releaseDate).toLocaleDateString('vi-VN')}` : '',
            ``,
            `#appstorespy #newrelease`,
        ].filter(line => line !== '').join('\n');

        // Fetch all active telegram group configurations
        const groupConfigs = await this.prisma.telegramGroupConfig.findMany({
            where: { active: true },
            include: { bot: true },
        });

        for (const config of groupConfigs) {
            if (!config.bot?.active || !config.bot?.name) continue;

            const runningBot = BotManager.getBot(config.bot.name);
            if (!runningBot) continue;

            try {
                const opts: any = { parse_mode: 'Markdown' };
                if (config.topicId) {
                    opts.message_thread_id = config.topicId;
                }
                await runningBot.api.sendMessage(config.chatId, message, opts);
            } catch (err: any) {
                this.logger.error(`Failed to send New Release notification to config #${config.id}: ${err?.message}`);
            }
        }
    }
}
