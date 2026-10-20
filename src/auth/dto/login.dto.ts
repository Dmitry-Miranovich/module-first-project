import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDTO {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  login: string;
  @IsString()
  @MinLength(8)
  password: string;
}
