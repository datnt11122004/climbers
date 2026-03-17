import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Inject
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { APP_CONFIG, AppConfig } from '#root/config';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
        const adapter = new PrismaPg({
            connectionString: config.DATABASE_URL
        });

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
