import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from 'src/database/schemas/project.schema';
import { BaseCRUDService } from 'src/shared/services/base-crud.service';

@Injectable()
export class ProjectService extends BaseCRUDService {
  private readonly logger = new Logger(ProjectService.name);
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {
    super(projectModel);
  }
}
