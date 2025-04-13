import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ENV_KEY,
  MICROSERVICE_MESSAGE_PATTERNS,
  QUEUE_NAME,
} from 'src/shared/constants';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.getOrThrow(ENV_KEY.RABBITMQ_CONN)],
        queue: QUEUE_NAME.IMAGE_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    } as RmqOptions);
  }

  /**
   * Resizes an image and emits a message to the microservice.
   * @param file The image file to resize.
   * @returns An observable that emits the result of the operation.
   */
  async resizeImage(file: Express.Multer.File): Promise<Observable<string>> {
    if (!file || !file.buffer) {
      throw new Error('Invalid file: File or file buffer is undefined');
    }

    const metadata = {
      filename: file.originalname,
      contentType: 'text/plain',
      fileData: file.buffer.toString('base64'),
    };

    try {
      return this.client.emit<string>(
        MICROSERVICE_MESSAGE_PATTERNS.IMAGE.IMAGE_UPLOADED,
        metadata,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }
}
