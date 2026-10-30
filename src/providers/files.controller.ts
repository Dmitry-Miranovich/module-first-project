import {
  Controller,
  NotFoundException,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import type { Express } from 'express';
import { FileService } from './files.service.js';
import { AuthJWTGuard } from '../auth/auth.guard.js';
import { FileSizeValidationPipe } from './pipes/file-size.pipe.js';
import { UserService } from '../user/user.service.js';

@UseGuards(AuthJWTGuard)
@Controller('files')
export class FilesController {
  constructor(
    private readonly fileService: FileService,
    private readonly userService: UserService,
  ) {}
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'avatars',
        maxCount: 5,
      },
    ]),
  )
  async uploadFile(
    @Req() request: any,
    @UploadedFiles(new FileSizeValidationPipe())
    files: { avatars?: Array<Express.Multer.File> },
  ) {
    const { user } = request;
    const { avatars } = files;

    const userEntity = await this.userService.findByCriteria(user.sub, 'id');
    if (userEntity === null) {
      throw new NotFoundException('User is not found by provided ID');
    }
    const folderName = `${userEntity.login}/avatars`;
    const fileEntity = await this.fileService.uploadFile(
      avatars!.map((file) => ({
        file: file,
        folder: folderName,
        name: file.originalname,
      })),
      user.sub,
    );
    // return fileEntity;
  }
}
