import { Module } from '@nestjs/common';
import { PcaModule } from './modules/pca/pca.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from './modules/schedule/schedule.module';

@Module({
  imports: [PcaModule, ConfigModule.forRoot(), ScheduleModule],
})
export class AppModule {}
