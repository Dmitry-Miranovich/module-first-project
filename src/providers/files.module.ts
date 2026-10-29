import { Module } from '@nestjs/common';

import { IFileService } from './files.adapter.js';
import { S3Module } from './s3/s3.module.js';
import { S3Service } from './s3/s3.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFile } from './entity/user-file.entity.js';
import { FilesController } from './files.controller.js';
import { FileService } from './files.service.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [S3Module, TypeOrmModule.forFeature([UserFile]), UserModule],
  controllers: [FilesController],
  providers: [
    FileService,
    {
      provide: IFileService,
      useClass: S3Service,
    },
  ],
  exports: [IFileService, FileService],
})
export class FilesModule {}
