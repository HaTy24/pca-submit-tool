import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  code: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
