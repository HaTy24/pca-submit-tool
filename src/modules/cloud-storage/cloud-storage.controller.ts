import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudStorageService } from './cloud-storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return this.cloudStorageService.uploadFile(file);
  }
}
