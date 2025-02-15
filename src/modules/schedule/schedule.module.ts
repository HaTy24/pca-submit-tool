import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { PcaModule } from '../pca/pca.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PcaModule, NestScheduleModule.forRoot()],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
