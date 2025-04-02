import { Injectable } from '@nestjs/common';
import { DropboxProvider } from './dropbox.provider';
import { CloudStorageProvider } from 'src/shared/interfaces';
import { CLOUDSTORAGE } from 'src/shared/constants';

@Injectable()
export class CloudStorageFactory {
  constructor(private readonly dropboxProvider: DropboxProvider) {}

  getProvider(providerName: string): CloudStorageProvider {
    switch (providerName) {
      case CLOUDSTORAGE.DROPBOX:
        return this.dropboxProvider;
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }
}
