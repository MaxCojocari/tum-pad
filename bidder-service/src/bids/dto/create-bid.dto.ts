import { IsNumber, IsPositive } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsPositive()
  auctionId: number;

  @IsNumber()
  @IsPositive()
  bidderId: number;

  @IsNumber()
  @IsPositive()
  amount: number;
}
