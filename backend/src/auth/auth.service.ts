import {
    Injectable,
    UnauthorizedException,
    Logger,
    Inject
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHmac, createHash } from 'crypto';
import { PrismaService } from '#root/prisma/prisma.service';
import { APP_CONFIG, AppConfig } from '#root/config';
import { TelegramLoginDto } from './dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        @Inject(APP_CONFIG) private readonly config: AppConfig
    ) {}

    /**
     * Verify Telegram Login Widget hash.
     * https://core.telegram.org/widgets/login#checking-authorization
     */
    verifyTelegramHash(data: TelegramLoginDto): boolean {
        const { hash, ...rest } = data;

        // Build the data-check-string
        const dataCheckString = Object.keys(rest)
            .sort()
            .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
            .join('\n');

        // Secret key = SHA256(bot_token)
        const secretKey = createHash('sha256')
            .update(this.config.TELEGRAM_BOT_TOKEN)
            .digest();

        // HMAC-SHA256(data-check-string, secret_key)
        const hmac = createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        return hmac === hash;
    }

    /**
     * Validate Telegram login data, upsert user, return JWT.
     */
    async validateTelegramLogin(data: TelegramLoginDto) {
        // 1. Verify hash
        if (!this.verifyTelegramHash(data)) {
            throw new UnauthorizedException('Invalid Telegram login data');
        }

        // 2. Check auth_date is not too old (allow 1 day)
        const now = Math.floor(Date.now() / 1000);
        if (now - data.auth_date > 86400) {
            throw new UnauthorizedException('Telegram login data expired');
        }

        // 3. Upsert TelegramUser
        const user = await this.prisma.telegramUser.upsert({
            where: { telegramId: data.id },
            update: {
                firstName: data.first_name,
                lastName: data.last_name || '',
                username: data.username,
                avatar: data.photo_url
            },
            create: {
                telegramId: data.id,
                firstName: data.first_name,
                lastName: data.last_name || '',
                username: data.username,
                avatar: data.photo_url
            }
        });

        this.logger.log(
            `User ${user.telegramId} (${user.firstName}) logged in`
        );

        // 4. Generate JWT
        const accessToken = this.generateJwt(user);

        return {
            accessToken,
            user: {
                id: user.id,
                telegramId: user.telegramId.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                avatar: user.avatar,
                role: user.role
            }
        };
    }

    generateJwt(user: { id: number; telegramId: bigint; role: string }) {
        const signOptions: JwtSignOptions = {
            secret: this.config.JWT_SECRET,
            expiresIn: this.config.JWT_EXPIRES_IN as any
        };
        return this.jwtService.sign(
            {
                sub: user.id,
                telegramId: user.telegramId.toString(),
                role: user.role
            },
            signOptions
        );
    }
}
