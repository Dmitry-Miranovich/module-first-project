import { QueryFailedError, Repository, DataSource } from 'typeorm';
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

@Injectable()
export class FileService implements IFileCustomService {
  private readonly logger = new Logger(FileService.name);
  constructor(
    @InjectRepository(UserFile)
    private readonly fileRep: Repository<UserFile>,
    private readonly fileService: IFileService,
    private readonly dataSource: DataSource,
  ) {}

  async uploadFile(
    options: UploadFilePayloadDto[],
    userId: string,
  ): Promise<UserFile[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const existingFiles = await this.fileRep.find({
      where: {
        userId: userId,
      },
    });
    if (existingFiles.length > 5) {
      throw new ConflictException(
        'File limit exceeded. There are more then five files.',
      );
    }
    const uploadedKeys: Array<{ folder: string; name: string }> = [];
    try {
      const fileEntities = options.map((file) =>
        this.fileRep.create({
          fileName: file.name,
          userId: userId,
        }),
      );

      //Uploading of actual files
      for (const file of options) {
        await this.fileService.uploadFile(file);
        uploadedKeys.push({
          folder: file.folder,
          name: file.name,
        });
      }
      //transaction start
      await queryRunner.startTransaction();
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
