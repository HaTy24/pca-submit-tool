import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PcaModule } from './modules/pca/pca.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { ENV_KEY } from './shared/constants';
import { ProjectModule } from './modules/project/project.module';
import { CloudStorageModule } from './modules/cloud-storage/cloud-storage.module';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get(ENV_KEY.MONGO_URI),
      }),
      inject: [ConfigService],
    }),
    MailerModule,
    PcaModule,
    ScheduleModule,
    TelegramModule,
    ProjectModule,
    CloudStorageModule,
  ],
})
export class AppModule {}
