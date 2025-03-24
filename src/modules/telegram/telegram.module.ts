import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_KEY } from 'src/shared/constants';
import { TelegramEventHandler } from './telegram-event.handler';
import { TelegrafModule } from 'nestjs-telegraf';
import { PcaModule } from '../pca/pca.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.getOrThrow(ENV_KEY.TELEGRAM_BASE_URL),
        timeout: 15000,
        interceptors: [],
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    PcaModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [TelegramEventHandler],
  exports: [TelegramEventHandler],
})
export class TelegramModule {}
