export interface FindOptions {
  sort: Record<string, number>;
  select: Record<string, number>;
  populate: any[];
}

export interface CloudStorageProvider {
  uploadFile(file: Express.Multer.File, filePath: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): Promise<string>;
}
