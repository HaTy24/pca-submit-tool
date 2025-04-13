import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';
import { ENV_KEY } from 'src/shared/constants';
import { CloudStorageProvider } from 'src/shared/interfaces';

@Injectable()
export class DropboxProvider implements CloudStorageProvider {
  private readonly dropbox: Dropbox;

  constructor(private readonly configService: ConfigService) {
    this.dropbox = new Dropbox({
      accessToken: this.configService.getOrThrow(ENV_KEY.DROPBOX_ACCESS_TOKEN),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    filePath: string,
  ): Promise<string> {
    try {
      // Upload file to Dropbox
      const response = await this.dropbox.filesUpload({
        path: filePath,
        contents: file,
        mode: { '.tag': 'overwrite' },
      });

      // Generate a shared link that's directly viewable
      const sharedLink = await this.dropbox.sharingCreateSharedLinkWithSettings(
        {
          path: response.result.path_lower,
          settings: {
            requested_visibility: { '.tag': 'public' },
          },
        },
      );

      // Convert the shared link to a direct link
      return sharedLink.result.url.replace(
        'www.dropbox.com',
        'dl.dropboxusercontent.com',
      );
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.dropbox.filesDeleteV2({ path: filePath });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    try {
      const response = await this.dropbox.sharingCreateSharedLinkWithSettings({
        path: filePath,
      });
      return response.result.url;
    } catch (error) {
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  }
}
