import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any) {
    // "value" is an object containing the file's attributes and metadata
    const oneKb = 1000;
    // If there is no file, reject (or return value if it's optional)
    if (!value) {
      throw new BadRequestException('File is required');
    }

    // If it fails the check, throw an error
    if (value.size >= oneKb) {
      throw new BadRequestException('File is too large. Max size is 1KB.');
    }

    return value;
  }
}
