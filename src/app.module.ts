import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudStorageModule } from './modules/cloud-storage/cloud-storage.module';
import { ImageModule } from './modules/image/image.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { PcaModule } from './modules/pca/pca.module';
import { ProjectModule } from './modules/project/project.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ENV_KEY } from './shared/constants';
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
    ProjectModule,
    CloudStorageModule,
    ImageModule,
  ],
})
export class AppModule {}
