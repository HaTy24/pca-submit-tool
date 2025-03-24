import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectSchema } from 'src/database/schemas/project.schema';
import { Project } from 'src/database/schemas/project.schema';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PcaModule } from '../pca/pca.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    PcaModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
