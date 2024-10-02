import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBidderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
