import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PcaService } from '../pca/pca.service';
import { getCurrentWeekMondayToSaturday } from 'src/shared/utils/date.util';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly pcaService: PcaService,
    private readonly telegramService: TelegramService,
  ) {}

  // At 09:00 AM, only on Saturday
  @Cron('0 9 * * 6')
  async handleCron() {
    try {
      const dates = getCurrentWeekMondayToSaturday();
      for (const date of dates) {
        this.pcaService.submit({
          date,
          statistics: [{ id: 158, code: 'FICO-CD-23', value: 100 }],
        });
      }
      this.telegramService.sendMessage(
        `Submit ${dates.length} days successfully!!!
        ${dates
          .map((date) =>
            new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          )
          .join('\n')}
        `,
      );
    } catch (error) {
      this.logger.error(error);
      this.telegramService.sendMessage(`Error: ${error}`);
    }
  }
}
