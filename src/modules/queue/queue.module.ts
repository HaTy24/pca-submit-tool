import { forwardRef, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';
import { CloudStorageModule } from '../cloud-storage/cloud-storage.module';

@Module({
  imports: [forwardRef(() => CloudStorageModule)],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService],
})
export class QueueModule {}
