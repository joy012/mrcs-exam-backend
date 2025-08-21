import { NestiaSwaggerComposer } from '@nestia/sdk';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { ConfigService } from './libs/config/config.service';
import { GlobalExceptionFilter } from './utils/exception';

const logger = new Logger('Bootstrap');

const setupSwagger = async (app: INestApplication, config: ConfigService) => {
  const document = await NestiaSwaggerComposer.document(app, {
    info: {
      title: 'MRCS Mock Exam Backend',
      description: 'MRCS Mock Exam Backend API',
      version: '1.0.0',
    },
    security: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token',
      },
    },
    servers: [
      {
        description: 'Local',
        url: `http://localhost:${config.port}`,
      },
      {
        url: 'https://mrcs-exam-backend-production.up.railway.app',
        description: 'Production',
      },
    ],
  });

  SwaggerModule.setup('api', app, document as any, {
    swaggerOptions: {
      persistAuthorization: true,
      syntaxHighlight: {
        activate: true,
        theme: 'obsidian',
      },
      docExpansion: 'none',
      displayRequestDuration: true,
      defaultModelExpandDepth: 8,
      defaultModelsExpandDepth: 8,
    },
    customSiteTitle: 'MRCS Mock Exam Backend',
  });

  return document;
};

const bootstrap = async (): Promise<void> => {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const validationPipe = new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      transform: true,
    });

    app.useGlobalPipes(validationPipe);

    app.useGlobalFilters(new GlobalExceptionFilter());

    const appConfig = app.get(ConfigService);

    app.useBodyParser('json', { limit: '50mb' });
    app.setGlobalPrefix('api');

    // app.enableVersioning({ type: VersioningType.URI });
    app.enableCors({ origin: true });

    // Setup Swagger
    const doc = await setupSwagger(app, appConfig);

    app.use('/api/reference/json', (_: Request, res: Response) => {
      res.json(doc);
    });

    await app.listen(appConfig.port);

    logger.log(
      `🚀 Application is running on: http://localhost:${appConfig.port}`,
    );
    logger.log(
      `📚 Swagger documentation available at: http://localhost:${appConfig.port}/api`,
    );
    logger.log(`🌍 Environment: ${appConfig.nodeEnv}`);
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};

bootstrap().catch((err) => {
  logger.error('Error starting application:', err);
  process.exit(1);
});
