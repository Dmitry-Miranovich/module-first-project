import { UserFile } from '../entity/user-file.entity.js';
import { RemoveFilePayloadDto } from '../s3/dto/remove-file-payload.dto.js';
import { UploadFilePayloadDto } from '../s3/dto/upload-file-payload.dto.js';

interface IFileCustomService {
  uploadFile(options: UploadFilePayloadDto, userId: string): Promise<UserFile>;
  removeFile(options: RemoveFilePayloadDto, userId: string): Promise<UserFile>;
}

export type { IFileCustomService };
