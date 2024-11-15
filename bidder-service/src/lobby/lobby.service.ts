import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bids/entities/bid.entity';
import * as dayjs from 'dayjs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auction } from './interfaces/auction.interface';
import { Lobby } from './entities/lobby.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LobbyService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
    @InjectRepository(Lobby)
    private readonly lobbyRepository: Repository<Lobby>,
    private readonly configService: ConfigService,
    @Inject('AUCTION_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  findAll() {
    return this.lobbyRepository.find();
  }

  async findOne(auctionId: number) {
    const lobby = await this.lobbyRepository.findOne({ where: { auctionId } });
    if (!lobby) {
      throw new NotFoundException(`Lobby for auctionId ${auctionId} not found`);
    }
    return lobby;
  }

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
      timestamp: dayjs(bid.timestamp).add(2, 'hour').toISOString(),
    }));
    const remainingTime = this.calculateRemainingTime(auction.endTimestamp);

    return {
      auctionId: auction.id,
      bids: formattedBids,
      remainingTime,
      status: auction.status,
    };
  }

  async getLobbyWsUrl(auctionId: number) {
    const { lobbyWsUrl } = await this.lobbyRepository.findOne({
      where: { auctionId },
    });
    return lobbyWsUrl;
  }

  async createLobby(auctionId: number) {
    const port = this.configService.get('app.port');
    const lobbyWsUrl = `ws://localhost:${port}/auctions/${auctionId}/lobby`;
    await this.lobbyRepository.save({ auctionId, lobbyWsUrl });
    return { lobbyWsUrl };
  }

  async deleteLobby(auctionId: number) {
    const lobby = await this.findOne(auctionId);

    if (!lobby) {
      throw new NotFoundException(`Lobby for auctionId ${auctionId} not found`);
    }

    await this.lobbyRepository.remove(lobby);
    return {
      message: `Lobby for auction with ID ${auctionId} removed successfully.`,
    };
  }

  private calculateRemainingTime(auctionEndTime: string): string {
    const now = dayjs().add(2, 'hour').toISOString();
    const endTime = dayjs(auctionEndTime);

    if (endTime.isBefore(now)) {
      return '0 minutes';
    }

    const duration = endTime.diff(now, 'minute');

    return `${duration} minutes`;
  }
}
