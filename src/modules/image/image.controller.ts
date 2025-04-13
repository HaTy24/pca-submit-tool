import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
import { ImageService } from './image.service';
import { Observable } from 'rxjs';

@Controller('image')
export class ImageController {
  constructor(
    private readonly cloudStorageService: CloudStorageService,
    private readonly imageService: ImageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Observable<string>> {
    return this.imageService.resizeImage(file);

    // return this.cloudStorageService.uploadFile(file);
  }
}
