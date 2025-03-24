import { Controller, Get, Logger } from '@nestjs/common';
import { PcaService } from './pca.service';

@Controller('pca')
export class PcaController {
  private readonly logger = new Logger(this.constructor.name);
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
  async submit() {
    const date = new Date().toISOString().split('T')[0];
    const statistics = [{ id: 158, code: 'FICO-CD-23', value: 100 }];
    try {
      await this.pcaService.submit({
        date,
        statistics,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
