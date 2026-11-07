import { QueryFailedError, Repository, DataSource, ILike, Like } from 'typeorm';
import { UserFile } from './entity/user-file.entity.js';
import { IFileCustomService } from './interfaces/files-service.interface.js';
import { RemoveFilePayloadDto } from './s3/dto/remove-file-payload.dto.js';
import { UploadFilePayloadDto } from './s3/dto/upload-file-payload.dto.js';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IFileService } from './files.adapter.js';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'node:path';

@Injectable()
export class FileService implements IFileCustomService {
  private readonly logger = new Logger(FileService.name);
  constructor(
    @InjectRepository(UserFile)
    private readonly fileRep: Repository<UserFile>,
    private readonly fileService: IFileService,
    private readonly dataSource: DataSource,
  ) {}

  private async getDuplicatedFile(
    fileName: string,
    userID: string,
  ): Promise<string> {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const existingFiles = await this.fileRep.find({
      where: {
        fileName: Like(`${baseName}%`),
        userId: userID,
      },
      select: {
        fileName: true,
      },
    });

    const existingNames = new Set(existingFiles.map((f) => f.fileName));
    if (!existingNames.has(fileName)) {
      return fileName;
    }
    let counter = 1;
    let newName = `${baseName} (${counter})${ext}`;
    while (existingNames.has(newName)) {
      counter++;
      newName = `${baseName} (${counter})${ext}`;
    }
    return newName;
  }

  async uploadFile(
    options: UploadFilePayloadDto[],
    userId: string,
  ): Promise<UserFile[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const existingFiles = await this.fileRep.count({
      where: {
        userId: userId,
      },
    });
    if (existingFiles > 5) {
      throw new ConflictException(
        'File limit exceeded. There are more then five files.',
      );
    }

    const fileForUpload: Array<UploadFilePayloadDto> = [];

    for (const file of options) {
      const transformedFileName = await this.getDuplicatedFile(
        file.name,
        userId,
      );
      fileForUpload.push({
        file: file.file,
        name: transformedFileName,
        folder: file.folder,
      });
    }
    const uploadedKeys: Array<{ folder: string; name: string }> = [];
    try {
      const fileEntities = fileForUpload.map((file) =>
        this.fileRep.create({
          fileName: file.name,
          userId: userId,
        }),
      );

      //Uploading of actual files
      for (const file of fileForUpload) {
        await this.fileService.uploadFile(file);
        uploadedKeys.push({
          folder: file.folder,
          name: file.name,
        });
      }
      //transaction start

      await queryRunner.manager.save(fileEntities);
      await queryRunner.commitTransaction();

      //transaction end
      return fileEntities;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Unexpected error while uploading files. Providing cleanup',
      );
      for (const file of uploadedKeys) {
        await this.fileService.removeFile({
          path: `${file.folder}/${file.name}`,
        });
      }
      if (
        err instanceof QueryFailedError &&
        (err as any).driverError?.code === '23505'
      ) {
        this.logger.error(`QueryRunner: Failed to save files. Error: ${err}`);
        throw new ConflictException(`File with the name thats already exists`);
      }
      throw new HttpException(
        'Internal error while saving',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
  removeFile(options: RemoveFilePayloadDto, userId: string): Promise<UserFile> {
    throw new Error('Method not implemented.');
  }
}
