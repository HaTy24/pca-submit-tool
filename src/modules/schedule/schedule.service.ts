import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PcaService } from '../pca/pca.service';
import { getCurrentWeekMondayToSaturday } from 'src/shared/utils/date.util';

@Injectable()
export class ScheduleService {
  constructor(private readonly pcaService: PcaService) {}

  // At 09:00 AM, only on Saturday
  @Cron('0 9 * * 6')
  async handleCron() {
    const dates = getCurrentWeekMondayToSaturday();
    for (const date of dates) {
      this.pcaService.submit({
        date,
        statistics: [{ id: 158, code: 'FICO-CD-23', value: 100 }],
      });
    }
  }
}
