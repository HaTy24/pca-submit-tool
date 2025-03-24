import { Controller, Get, Logger } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PcaService } from '../pca/pca.service';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly projectService: ProjectService,
    private readonly pcaService: PcaService,
  ) {}

  @Get('/craw')
  async craw() {
    try {
      const response = await this.pcaService.getProjects({ getAll: true });
      await this.projectService.bulkCreate(response.data);

      return { message: 'Crawling projects successfully' };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
