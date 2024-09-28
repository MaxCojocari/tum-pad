import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(@Inject('AUCTION') private readonly auctionClient: ClientProxy) {}

  getHello(): string {
    return 'Hello World!';
  }

  async addBidInAuction() {
    console.log('start addBidInAuction');
    const result = await firstValueFrom(
      this.auctionClient.send({ cmd: 'add_bid_in_auction' }, {}),
    );
    console.log('Response from Service B:', result);
  }

  receiveAck() {
    console.log('received_ack');
  }
}
