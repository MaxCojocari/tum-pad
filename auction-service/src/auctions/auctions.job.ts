import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Auction } from './entities/auction.entity';
import { AuctionStatus } from './interfaces/auction-status.enum';
import { ClientGrpc } from '@nestjs/microservices';
import { BidsServiceGrpc } from './interfaces/bids-service.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuctionsJob {
  private bidsService: BidsServiceGrpc;

  onModuleInit() {
    this.bidsService = this.client.getService<BidsServiceGrpc>('BidsService');
  }

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @Inject('BIDDER_PACKAGE') private readonly client: ClientGrpc,
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
      const highestBids = await firstValueFrom(
        this.bidsService.findBidsByAuction({ auctionId: auction.id }),
      );

      auction.status = AuctionStatus.CLOSED;
      if (highestBids.bids) {
        auction.winnerId = highestBids.bids[0].bidderId;
        auction.winningFinalAmount = highestBids.bids[0].amount;
      }
      await this.auctionRepository.save(auction);
    }
  }
}
