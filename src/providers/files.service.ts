import { QueryFailedError, Repository } from 'typeorm';
import { UserFile } from './entity/user-file.entity.js';
import { IFileCustomService } from './interfaces/files-service.interface.js';
import { RemoveFilePayloadDto } from './s3/dto/remove-file-payload.dto.js';
import { UploadFilePayloadDto } from './s3/dto/upload-file-payload.dto.js';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { IFileService } from './files.adapter.js';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileService implements IFileCustomService {
  constructor(
    @InjectRepository(UserFile)
    private readonly fileRep: Repository<UserFile>,
    private readonly fileService: IFileService,
  ) {}

  async uploadFile(
    options: UploadFilePayloadDto,
    userId: string,
  ): Promise<UserFile> {
    try {
      const fileEntity = this.fileRep.create({
        fileName: options.name,
        userId: userId,
      });
      await this.fileRep.save(fileEntity);
      await this.fileService.uploadFile(options);
      return fileEntity;
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as any).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          `File with the name ${options.name} already exists`,
        );
      }
      throw new HttpException(
        'Internal error while saving',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  removeFile(options: RemoveFilePayloadDto, userId: string): Promise<UserFile> {
    throw new Error('Method not implemented.');
  }
}
