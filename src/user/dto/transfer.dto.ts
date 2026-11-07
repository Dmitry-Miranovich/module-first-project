import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;
  @IsNumberString()
  @IsNotEmpty()
  amount: string;
}
