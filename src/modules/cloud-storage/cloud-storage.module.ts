import { forwardRef, Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { CloudStorageFactory } from './cloud-storage.factory';
import { CloudStorageService } from './cloud-storage.service';
import { DropboxProvider } from './dropbox.provider';

@Module({
  imports: [forwardRef(() => QueueModule)],
  providers: [DropboxProvider, CloudStorageFactory, CloudStorageService],
  exports: [CloudStorageFactory, CloudStorageService],
})
export class CloudStorageModule {}
