import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_KEY } from 'src/shared/constants';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { PcaModule } from '../pca/pca.module';

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
  ],
  controllers: [],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
