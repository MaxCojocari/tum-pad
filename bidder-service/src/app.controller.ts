import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

interface Bid {
  bidderId: number;
  bidAmount: number;
}

interface AuctionUpdateDto {
  auctionId: number;
  bids: Bid[];
  auctionStatus: string;
  remainingTime: number;
}

interface CreateLobbyDto {
  auctionId: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  addBid() {
    return this.appService.addBidInAuction();
  }

  @GrpcMethod('BidderService')
  sendAuctionUpdate(data: AuctionUpdateDto) {
    console.log('BidderService sendAuctionUpdate');
    console.dir(data, { depth: null });
    return { message: 'Ok' };
  }

  @GrpcMethod('BidderService')
  createLobby(data: CreateLobbyDto) {
    console.log('BidderService createLobby');
    console.dir(data, { depth: null });
    return { message: 'Ok' };
  }
}
