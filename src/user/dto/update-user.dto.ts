import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class UpdateUserDTO {
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
  @IsOptional()
  @IsInt()
  age?: number;
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(1000)
  description?: string;
}
