import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface AuctionService {
  placeBid(data: {
    auctionId: number;
    bidderId: number;
    bidAmount: number;
  }): Observable<{
    bidId: number;
    message: string;
  }>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private auctionService: AuctionService;

  constructor(@Inject('AUCTION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.auctionService =
      this.client.getService<AuctionService>('AuctionService');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async addBidInAuction() {
    const data = {
      auctionId: 1,
      bidderId: 2,
      bidAmount: 22.33,
    };
    console.log('start addBidInAuction');

    const observable = this.auctionService.placeBid(data);
    const result = await firstValueFrom(observable);
    console.log('Response from Service B:', result);
    console.dir(result, { depth: null });
  }
}
