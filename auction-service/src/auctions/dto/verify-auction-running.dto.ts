import { IsNumber, Min } from 'class-validator';

export class VerifyAuctionRunningDto {
  @IsNumber()
  @Min(1)
  auctionId: number;
}
