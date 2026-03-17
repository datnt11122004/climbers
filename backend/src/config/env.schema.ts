import { z } from 'zod';

export const envSchema = z.object({
    PORT: z.coerce.number().default(8080),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    // Database Configuration
    DATABASE_URL: z
        .string()
        .default('postgresql://postgres:mypassword@localhost:5432/climbers'),

    // CORS
    CORS_ORIGINS: z.string().default('http://localhost:3000'),

    // Telegram Bot Token (for login hash verification)
    TELEGRAM_BOT_TOKEN: z.string(),

    // JWT Configuration
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // Frontend URL (for redirects)
    FRONTEND_URL: z.string().default('http://localhost:3000'),

    // AppStoreSpy API
    APPSTORESPY_API_KEY: z.string()
});

export type AppConfig = z.infer<typeof envSchema>;
