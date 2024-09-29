import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface BidderService {
  sendAuctionUpdate(
    request: AuctionUpdateRequest,
  ): Observable<AuctionUpdateResponse>;
  createLobby(request: CreateLobbyRequest): Observable<CreateLobbyResponse>;
}

interface AuctionUpdateRequest {
  auctionId: number;
  bids: Bid[];
  auctionStatus: string;
  remainingTime: number;
}

interface Bid {
  bidderId: number;
  bidAmount: number;
}

interface AuctionUpdateResponse {
  message: string;
}

interface CreateLobbyRequest {
  auctionId: number;
}

interface CreateLobbyResponse {
  message: string;
}

@Injectable()
export class AppService implements OnModuleInit {
  private bidderService: BidderService;

  constructor(@Inject('BIDDER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.bidderService = this.client.getService<BidderService>('BidderService');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async updateAuctionWithBid(
    auctionId: number,
    bidderId: number,
    bidAmount: number,
  ) {
    console.log('updateAuctionWithBid');
    console.log({
      auctionId,
      bidderId,
      bidAmount,
    });

    const res_1 = await firstValueFrom(
      this.bidderService.createLobby({ auctionId }),
    );
    console.log('res createLobby', res_1);

    const res_2 = await firstValueFrom(
      this.bidderService.sendAuctionUpdate({
        auctionId,
        bids: [
          {
            bidderId,
            bidAmount,
          },
          {
            bidderId,
            bidAmount,
          },
          {
            bidderId,
            bidAmount,
          },
        ],
        auctionStatus: 'ACTIVE',
        remainingTime: 12345,
      }),
    );
    console.log('res sendAuctionUpdate', res_2);

    return { bidId: 1, message: 'Ok' };
  }
}
