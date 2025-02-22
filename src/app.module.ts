import { Module } from '@nestjs/common';
import { PcaModule } from './modules/pca/pca.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MailerModule,
    PcaModule,
    ScheduleModule,
    TelegramModule,
  ],
})
export class AppModule {}
