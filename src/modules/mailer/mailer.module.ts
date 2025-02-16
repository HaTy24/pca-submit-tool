import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAILER_HOST'),
          port: configService.get('MAILER_PORT'),
          secure: false,
          auth: {
            type: 'OAuth2',
            user: configService.get('MAILER_USER'),
            clientId: configService.get('MAILER_CLIENT_ID'),
            clientSecret: configService.get('MAILER_CLIENT_SECRET'),
            refreshToken: configService.get('MAILER_REFRESH_TOKEN'),
            accessToken: configService.get('MAILER_ACCESS_TOKEN'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
