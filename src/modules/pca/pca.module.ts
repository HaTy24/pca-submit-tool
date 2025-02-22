import { Module } from '@nestjs/common';
import { PcaService } from './pca.service';
import { PcaController } from './pca.controller';
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
        interceptors: [],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PcaController],
  providers: [PcaService],
  exports: [PcaService],
})
export class PcaModule {}
