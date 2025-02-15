import { Module } from '@nestjs/common';
import { AuthService } from './submit.service';
import { AuthController } from './submit.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_KEY } from 'src/shared/constants';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.getOrThrow(ENV_KEY.PCA_BASE_URL),
        timeout: 15000,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
