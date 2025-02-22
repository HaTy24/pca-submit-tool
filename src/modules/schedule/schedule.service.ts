import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PcaService } from '../pca/pca.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly pcaService: PcaService,
    private readonly telegramService: TelegramService,
  ) {}

  // // At 08:00 PM, only on Monday, Tuesday, Wednesday, Thursday, Friday, and Saturday
  // @Cron('0 20 * * 1,2,3,4,5,6')
  // async handleCron() {
  //   const date = new Date().toISOString().split('T')[0];
  //   const statistics = [{ id: 158, code: 'FICO-CD-23', value: 100 }];
  //   try {
  //     this.pcaService.submit({
  //       date,
  //       statistics,
  //     });
  //     this.telegramService.sendMessage(
  //       `Success! 🎉\nSubmit ${date} days successfully! 📅\nnStatistics: ${JSON.stringify(statistics)}`,
  //     );
  //   } catch (error) {
  //     this.logger.error(error);
  //     this.telegramService.sendMessage(
  //       `❌ Error occurred!\nDate: ${date}\nStatistics: ${JSON.stringify(statistics)}\nError: ${error.message || error}`,
  //     );
  //   }
  // }

  // At 07:00 PM, only on Monday, Tuesday, Wednesday, Thursday, Friday, and Saturday
  @Cron('0 19 * * 1,2,3,4,5,6')
  async handleCron() {
    try {
      this.telegramService.sendMessage(
        "🔔 Reminder: Don't forget to submit today's work!\n\n" +
          'Submit format:\n👉 `/submit ~ task_id1, task_id2`\n\n' +
          'Other commands:\n' +
          '📌 Get project list: `/projects`\n' +
          '➕ Add new project: `/add ~ id: project_id, code: project_code`\n\n' +
          'Thanks! 🚀',
      );
    } catch (error) {
      this.logger.error(error);
      this.telegramService.sendMessage(
        `❌ ${this.constructor.name}\nError occurred!\nError: ${error.message || error}`,
      );
    }
  }
}
