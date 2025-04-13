import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEY } from 'src/shared/constants';
import { CloudStorageProvider } from 'src/shared/interfaces';
import { CloudStorageFactory } from './cloud-storage.factory';
import { ProducerService } from '../queue/producer.service';

@Injectable()
export class CloudStorageService implements CloudStorageProvider {
  constructor(
    private readonly cloudStorageFactory: CloudStorageFactory,
    private readonly configService: ConfigService,
    private readonly producerService: ProducerService,
  ) {}

  /**
   * Uploads a file to the cloud storage provider.
   * @param file The file to upload.
   * @returns The URL of the uploaded file.
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      if (file.size === 0) {
        throw new Error('File is empty');
      }

      const providerName = this.configService.getOrThrow(
        ENV_KEY.STORAGE_PROVIDER,
      );
      const filePath = `/images/${file.originalname}`;

      await this.producerService.addToUploadQueue({
        file: file.buffer.toString('base64'),
        filePath,
        providerName,
      });

      return 'File upload initiated successfully. Check the queue for status.';
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadFileToCloudStorage(
    file: Express.Multer.File,
    filePath: string,
    providerName: string,
  ): Promise<string> {
    try {
      const provider = this.cloudStorageFactory.getProvider(providerName);
      const uploadResult = await provider.uploadFile(file, filePath);
      return uploadResult;
    } catch (error) {
      throw new Error(
        `Failed to upload file to cloud storage: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a file from the cloud storage provider.
   * @param filePath The path of the file to delete.
   */
  deleteFile(filePath: string): Promise<void> {
    try {
      const providerName = this.configService.getOrThrow(
        ENV_KEY.STORAGE_PROVIDER,
      );
      const provider = this.cloudStorageFactory.getProvider(providerName);

      return provider.deleteFile(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Gets the URL of a file from the cloud storage provider.
   * @param filePath The path of the file.
   * @returns The URL of the file.
   */
  getFileUrl(filePath: string): Promise<string> {
    try {
      const providerName = this.configService.getOrThrow(
        ENV_KEY.STORAGE_PROVIDER,
      );
      const provider = this.cloudStorageFactory.getProvider(providerName);

      return provider.getFileUrl(filePath);
    } catch (error) {
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  }
}
