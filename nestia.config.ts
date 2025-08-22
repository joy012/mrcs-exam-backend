import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

const config: INestiaConfig = {
  input: () => NestFactory.create(AppModule),

  swagger: {
    output: './swagger.json',
    security: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    info: {
      title: 'Zero To MRCS Backend',
      description: 'Zero To MRCS API',
      version: '1.0.0',
    },
    beautify: true,
    servers: [],
  },
};
export default config;
