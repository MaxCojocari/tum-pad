import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

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

  @MessagePattern({ cmd: 'ack_add_bid_in_auction' })
  receiveAck() {
    return this.appService.receiveAck();
  }
}
