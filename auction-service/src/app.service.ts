import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('BIDDER') private readonly bidderClient: ClientProxy) {}

  getHello(): string {
    return 'Hello World!';
  }

  updateAuctionWithBid() {
    console.log('updateAuctionWithBid');

    return 'Updated auction';
  }
}
