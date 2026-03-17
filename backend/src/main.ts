import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { APP_CONFIG, AppConfig } from '#root/config';
import {
    HttpErrorFilter,
    AllExceptionsFilter,
    HttpExceptionFilter
} from '#root/common/filters';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'log']
    });

    const config = app.get<AppConfig>(APP_CONFIG);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    );

    app.enableCors({
        origin: config.CORS_ORIGINS.split(',').map((s) => s.trim()),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true
    });
    app.useGlobalFilters(new HttpErrorFilter());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

    // Swagger Setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Steamy Climbers API')
        .setDescription('API for app category management and tracking')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const port = Number(config.PORT);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Swagger API docs: http://localhost:${port}/api`);
    await app.listen(port);
}

bootstrap();
