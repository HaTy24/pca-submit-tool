import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ENV_KEY } from 'src/shared/constants';
import { CloudStorageFactory } from './cloud-storage.factory';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly cloudStorageFactory: CloudStorageFactory,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }

    const providerName = this.configService.getOrThrow(
      ENV_KEY.STORAGE_PROVIDER,
    );
    const provider = this.cloudStorageFactory.getProvider(providerName);
    const filePath = `/images/${file.originalname}`;

    return provider.uploadFile(file, filePath);
  }
}
