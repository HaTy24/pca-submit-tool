import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { ENV_KEY, QUEUE_NAME } from 'src/shared/constants';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private channelWrapper: ChannelWrapper;
  constructor(
    private readonly configService: ConfigService,
    private readonly cloudStorageService: CloudStorageService,
  ) {
    const connection = amqp.connect([
      this.configService.getOrThrow(ENV_KEY.RABBITMQ_CONN),
    ]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(QUEUE_NAME.UPLOAD_QUEUE, { durable: true });
        await channel.consume(QUEUE_NAME.UPLOAD_QUEUE, async (message) => {
          if (message) {
            const content = JSON.parse(message.content.toString());
            const { file, filePath, providerName } = content;
            const fileBuffer = Buffer.from(
              file,
              'base64',
            ) as unknown as Express.Multer.File;

            await this.cloudStorageService.uploadFileToCloudStorage(
              fileBuffer,
              filePath,
              providerName,
            );
            this.logger.log('File uploaded successfully:', filePath);

            // Acknowledge the message
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}
