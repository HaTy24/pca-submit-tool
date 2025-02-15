import { Controller, Get } from '@nestjs/common';
import { PcaService } from './pca.service';
import { getCurrentWeekMondayToSaturday } from 'src/shared/utils/date.util';

@Controller('pca')
export class PcaController {
  constructor(private readonly pcaService: PcaService) {}

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
    const dates = getCurrentWeekMondayToSaturday();
    dates.forEach((date) => {
      this.pcaService.submit({
        date,
        statistics: [{ id: 158, code: 'FICO-CD-23', value: 100 }],
      });
    });
  }
}
