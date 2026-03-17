import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, envSchema } from './env.schema';

export const APP_CONFIG = 'APP_CONFIG';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.local', '.env'],
            validate: (env) => {
                const parsed = envSchema.safeParse(env);
                if (!parsed.success) {
                    console.error('❌ Invalid environment variables:');
                    console.error(parsed.error.format());
                    throw new Error('Invalid environment variables');
                }
                return parsed.data;
            }
        })
    ],
    providers: [
        {
            provide: APP_CONFIG,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): AppConfig => {
                return (configService as any).internalConfig
                    ._PROCESS_ENV_VALIDATED as AppConfig;
            }
        }
    ],
    exports: [APP_CONFIG, ConfigModule]
})
export class AppConfigModule {}
