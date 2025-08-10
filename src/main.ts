import { NestiaSwaggerComposer } from '@nestia/sdk';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './libs/config/config.service';

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
        url: `https://api.mrcs-mock.com`,
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
};

const setupCors = (app: INestApplication) => {
  app.enableCors({
    origin: true, // Allow all origins for now
    credentials: true,
  });
};

const bootstrap = async (): Promise<void> => {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const config = app.get(ConfigService);

    // Setup CORS
    setupCors(app);

    // Setup Swagger
    await setupSwagger(app, config);

    // Start the application
    await app.listen(config.port, '0.0.0.0');

    logger.log(`🚀 Application is running on: http://localhost:${config.port}`);
    logger.log(
      `📚 Swagger documentation available at: http://localhost:${config.port}/api`,
    );
    logger.log(`🌍 Environment: ${config.nodeEnv}`);
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};

bootstrap().then();
