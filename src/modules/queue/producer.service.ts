import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { ENV_KEY, QUEUE_NAME } from 'src/shared/constants';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(this.constructor.name);
  private channelWrapper: ChannelWrapper;
  constructor(private readonly configService: ConfigService) {
    const connection = amqp.connect([
      this.configService.getOrThrow(ENV_KEY.RABBITMQ_CONN),
    ]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue(QUEUE_NAME.UPLOAD_QUEUE, { durable: true });
      },
    });
  }

  async addToEmailQueue(mail: any) {
    try {
      await this.channelWrapper.sendToQueue(
        QUEUE_NAME.EMAIL_QUEUE,
        Buffer.from(JSON.stringify(mail)),
        {
          persistent: true,
        },
      );
      this.logger.debug('Sent To Queue');
    } catch (error) {
      this.logger.error(error.message);

      throw new HttpException(
        'Error adding mail to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToUploadQueue(data: any) {
    try {
      await this.channelWrapper.sendToQueue(
        QUEUE_NAME.UPLOAD_QUEUE,
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true,
        },
      );

      this.logger.debug('Sent To Upload Queue:', JSON.stringify(data));
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(
        'Error adding file to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
