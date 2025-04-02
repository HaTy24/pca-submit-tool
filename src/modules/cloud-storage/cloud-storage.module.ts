import { Module } from '@nestjs/common';
import { StorageController } from './cloud-storage.controller';
import { CloudStorageFactory } from './cloud-storage.factory';
import { DropboxProvider } from './dropbox.provider';

@Module({
  controllers: [StorageController],
  providers: [DropboxProvider, CloudStorageFactory],
  exports: [DropboxProvider, CloudStorageFactory],
})
export class CloudStorageModule {}
