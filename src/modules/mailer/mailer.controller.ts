import { Controller, Get } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Get('send')
  send() {
    return this.mailerService.sendEmail(
      'hathienty2000@gmail.com',
      'Test',
      'Test',
    );
  }
}
