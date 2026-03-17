import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '#root/prisma/prisma.service';
import { TelegramUser } from '@prisma/client';

@Injectable()
export class TelegramUserService {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(telegramId: bigint | number): Promise<TelegramUser> {
        return this.prisma.telegramUser.findUnique({
            where: { telegramId: BigInt(telegramId) }
        });
    }

    async create(
        telegramId: bigint | number,
        firstName: string,
        lastName: string,
        username?: string,
        language?: string,
        privateChatId?: bigint | number
    ): Promise<TelegramUser> {
        return this.prisma.telegramUser.create({
            data: {
                telegramId: BigInt(telegramId),
                firstName,
                lastName,
                username,
                language,
                privateChatId:
                    privateChatId != null ? BigInt(privateChatId) : undefined
            }
        });
    }

    async update(
        telegramId: bigint | number,
        firstName: string,
        lastName: string,
        username?: string,
        language?: string,
        privateChatId?: bigint | number
    ): Promise<TelegramUser> {
        return this.prisma.telegramUser.update({
            where: { telegramId: BigInt(telegramId) },
            data: {
                firstName,
                lastName,
                username,
                language,
                privateChatId:
                    privateChatId != null ? BigInt(privateChatId) : undefined
            }
        });
    }

    async upsert(
        telegramId: bigint | number,
        firstName: string,
        lastName: string,
        username?: string,
        language?: string,
        privateChatId?: bigint | number
    ): Promise<TelegramUser> {
        return this.prisma.telegramUser.upsert({
            where: { telegramId: BigInt(telegramId) },
            update: {
                firstName,
                lastName,
                username,
                language,
                privateChatId:
                    privateChatId != null ? BigInt(privateChatId) : undefined
            },
            create: {
                telegramId: BigInt(telegramId),
                firstName,
                lastName,
                username,
                language,
                privateChatId:
                    privateChatId != null ? BigInt(privateChatId) : undefined
            }
        });
    }
}
