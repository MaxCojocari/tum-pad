import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsPositive()
  auctionId: number;

  @IsString()
  @IsNotEmpty()
  bidderId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
