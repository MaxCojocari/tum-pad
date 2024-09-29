import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

interface PlaceBidDto {
  auctionId: number;
  bidderId: number;
  bidAmount: number;
}

interface PlaceBidResponseDto {
  bidId: number;
  message: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @GrpcMethod('AuctionService')
  async placeBid(data: PlaceBidDto): Promise<PlaceBidResponseDto> {
    console.log('AuctionService placeBid');
    console.log('data', data);

    return this.appService.updateAuctionWithBid(
      data.auctionId,
      data.bidderId,
      data.bidAmount,
    );
  }
}
