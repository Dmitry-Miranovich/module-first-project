import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const IMAGE_MIMETYPES = [
  'image/gif',
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/vnd.microsoft.icon',
  'image/vnd.wap.wbmp',
  'image/webp',
  'image/heif',
  'image/heic',
  'image/avif',
];

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any) {
    const avatars: Array<any> = value.avatars;
    const tenMB = 1000000;
    if (!value) {
      throw new BadRequestException('File is required');
    }
    if (
      avatars.some(
        (img) => !IMAGE_MIMETYPES.some((elem) => elem === img.mimetype),
      )
    ) {
      const incorrectFile = avatars.find(
        (img) => !IMAGE_MIMETYPES.some((elem) => elem === img.mimetype),
      );
      throw new BadRequestException(
        `Incorrect file type was send: ${incorrectFile.mimetype}`,
      );
    }
    if (avatars.some((img) => img.size >= tenMB)) {
      const foundFile = avatars.find((img) => img.size >= tenMB);
      throw new BadRequestException(
        `File ${foundFile.originalname} is too large. Max size is 10MB.`,
      );
    }
    return value;
  }
}
