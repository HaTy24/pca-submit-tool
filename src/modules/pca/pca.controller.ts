import { Controller, Get, Logger } from '@nestjs/common';
import { PcaService } from './pca.service';
import { getCurrentWeekMondayToSaturday } from 'src/shared/utils/date.util';
import { TelegramService } from '../telegram/telegram.service';

@Controller('pca')
export class PcaController {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly pcaService: PcaService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get('login')
  login() {
    return this.pcaService.login();
  }

  @Get('projects')
  getProjects() {
    return this.pcaService.getProjects();
  }

  @Get('submit')
  submit() {
    try {
      const dates = getCurrentWeekMondayToSaturday();
      for (const date of dates) {
        this.pcaService.submit({
          date,
          statistics: [{ id: 158, code: 'FICO-CD-23', value: 100 }],
        });
      }
      this.telegramService.sendMessage(
        `Submit ${dates.length} days successfully!!!\n${dates
          .map((date) => date)
          .join('\n')}
        `,
      );
    } catch (error) {
      this.logger.error(error);
      this.telegramService.sendMessage(`Error: ${error}`);
    }
  }
}
