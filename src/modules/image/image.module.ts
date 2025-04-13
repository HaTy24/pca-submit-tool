import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { CloudStorageModule } from '../cloud-storage/cloud-storage.module';

@Module({
  imports: [CloudStorageModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
