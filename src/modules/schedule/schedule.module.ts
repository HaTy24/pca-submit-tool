import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { PcaModule } from '../pca/pca.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [PcaModule, TelegramModule, NestScheduleModule.forRoot()],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
