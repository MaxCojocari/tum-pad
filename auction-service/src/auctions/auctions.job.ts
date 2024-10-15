import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Auction } from './entities/auction.entity';
import { AuctionStatus } from './interfaces/auction-status.enum';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindBidsByAuctionResponse } from './interfaces/bids-service.interface';

@Injectable()
export class AuctionsJob {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @Inject('BIDDER_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async updateAuctionStatuses() {
    const now = dayjs().add(3, 'hour').toISOString();
    const auctionsToStart = await this.auctionRepository.find({
      where: {
        status: AuctionStatus.CREATED,
        startTimestamp: LessThan(now),
      },
    });

    for (const auction of auctionsToStart) {
      auction.status = AuctionStatus.RUNNING;
      await this.auctionRepository.save(auction);
    }

    const auctionsToClose = await this.auctionRepository.find({
      where: {
        status: AuctionStatus.RUNNING,
        endTimestamp: LessThan(now),
      },
    });

    for (const auction of auctionsToClose) {
      const highestBids: FindBidsByAuctionResponse = await firstValueFrom(
        this.rabbitClient.send(
          { cmd: 'get-bids-by-auction' },
          { auctionId: auction.id },
        ),
      );

      auction.status = AuctionStatus.CLOSED;
      if (highestBids.bids && highestBids.bids.length > 0) {
        auction.winnerId = highestBids.bids[0].bidderId;
        auction.winningFinalAmount = highestBids.bids[0].amount;
      }
      await this.auctionRepository.save(auction);
    }
  }
}
