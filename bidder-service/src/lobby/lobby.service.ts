import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bids/entities/bid.entity';
import * as dayjs from 'dayjs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auction } from './interfaces/auction.interface';

@Injectable()
export class LobbyService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
    @Inject('AUCTION_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async getAuctionData(auctionId: number) {
    const auction: Auction = await firstValueFrom(
      this.natsClient.send({ cmd: 'get-auction' }, { auctionId }),
    );

    if (!auction) {
      throw new Error(`Auction with id ${auctionId} not found`);
    }

    const bids = await this.bidsRepository.find({ where: { auctionId } });

    const formattedBids = bids.map((bid) => ({
      bidderId: bid.bidderId,
      bidPrice: bid.amount,
      timestamp: dayjs(bid.timestamp).add(3, 'hour').toISOString(),
    }));
    const remainingTime = this.calculateRemainingTime(auction.endTimestamp);

    return {
      auctionId: auction.id,
      bids: formattedBids,
      remainingTime,
      status: auction.status,
    };
  }

  private calculateRemainingTime(auctionEndTime: string): string {
    const now = dayjs().add(3, 'hour').toISOString();
    const endTime = dayjs(auctionEndTime);

    if (endTime.isBefore(now)) {
      return '0 minutes';
    }

    const duration = endTime.diff(now, 'minute');

    return `${duration} minutes`;
  }
}
