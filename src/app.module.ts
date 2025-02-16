import { Module } from '@nestjs/common';
import { PcaModule } from './modules/pca/pca.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from './modules/schedule/schedule.module';

@Module({
  imports: [
    PcaModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    ScheduleModule,
  ],
})
export class AppModule {}
