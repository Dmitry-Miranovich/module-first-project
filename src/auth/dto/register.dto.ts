import {
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class RegisterDTO {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  login: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
  @IsInt()
  age: number;
  @IsString()
  @MinLength(0)
  @MaxLength(1000)
  description: string;
}
