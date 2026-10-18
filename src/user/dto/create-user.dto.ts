import {
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateUserDTO {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  passwordHash: string;
  @IsInt()
  age: number;
  @IsString()
  @MinLength(0)
  @MaxLength(1000)
  description: string;
}
