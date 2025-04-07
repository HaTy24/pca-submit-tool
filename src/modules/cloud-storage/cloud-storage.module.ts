import { forwardRef, Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { StorageController } from './cloud-storage.controller';
import { CloudStorageFactory } from './cloud-storage.factory';
import { CloudStorageService } from './cloud-storage.service';
import { DropboxProvider } from './dropbox.provider';

@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [StorageController],
  providers: [DropboxProvider, CloudStorageFactory, CloudStorageService],
  exports: [CloudStorageFactory, CloudStorageService],
})
export class CloudStorageModule {}
