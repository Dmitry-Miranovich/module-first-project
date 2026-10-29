import { UserFile } from '../entity/user-file.entity.js';

interface IFileController {
  uploadFile(): Promise<UserFile>;
}

export type { IFileController };
