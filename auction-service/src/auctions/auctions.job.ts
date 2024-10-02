import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Auction } from './entities/auction.entity';
import { AuctionStatus } from './interfaces/auction-status.enum';

@Injectable()
export class AuctionsJob {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
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
      auction.status = AuctionStatus.CLOSED;
      await this.auctionRepository.save(auction);
    }
  }
}
