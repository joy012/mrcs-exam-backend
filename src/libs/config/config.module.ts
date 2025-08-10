import { Global, Module } from '@nestjs/common';
import { parseEnv } from 'atenv';
import { ConfigService } from './config.service';

@Global()
@Module({
  exports: [ConfigService],
  providers: [
    {
      provide: ConfigService,
      useFactory: () => {
        const config = parseEnv(ConfigService);
        return config;
      },
    },
  ],
})
export class ConfigModule {}
