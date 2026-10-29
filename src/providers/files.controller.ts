import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { FileService } from './files.service.js';
import { AuthJWTGuard } from '../auth/auth.guard.js';
import { FileSizeValidationPipe } from './pipes/file-size.pipe.js';

@UseGuards(AuthJWTGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() request: any,
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
  ) {
    const { user } = request;
    await this.fileService.uploadFile(
      {
        file: file,
        folder: 'file.path',
        name: file.originalname,
      },
      user.sub,
    );
    return 'Some stuff';
  }
}
