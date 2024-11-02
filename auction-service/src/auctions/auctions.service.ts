import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Item } from './entities/item.entity';
import * as dayjs from 'dayjs';
import { AuctionStatus } from './interfaces/auction-status.enum';
import { ClientProxy } from '@nestjs/microservices';
import { FindBidsByAuctionResponse } from './interfaces/bids-service.interface';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @Inject('BIDDER_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async create(createAuctionDto: CreateAuctionDto) {
    const { item, startTimestamp, durationMinutes, ...auctionData } =
      createAuctionDto;

    let _item = await this.itemRepository.findOne({
      where: { name: item.name },
    });

    if (!_item) {
      _item = this.itemRepository.create(item);
      await this.itemRepository.save(_item);
    }

    const start = this.validateStartTimestamp(startTimestamp);
    const end = start.add(durationMinutes, 'minutes');

    const auction = this.auctionRepository.create({
      ...auctionData,
      item: _item,
      startTimestamp: start.toISOString(),
      endTimestamp: end.toISOString(),
      status: AuctionStatus.CREATED,
    });
    const savedAuction = await this.auctionRepository.save(auction);

    const { lobbyWsUrl } = await firstValueFrom(
      this.natsClient
        .send({ cmd: 'create-lobby' }, { auctionId: savedAuction.id })
        .pipe(timeout(5000)),
    );

    return {
      auctionId: savedAuction.id,
      lobbyWsUrl,
      message: 'Auction created successfully',
    };
  }

  findAll() {
    return this.auctionRepository.find({ relations: ['item'] });
  }

  async findOne(id: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: { item: true },
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    const fetchedBids: FindBidsByAuctionResponse = await firstValueFrom(
      this.natsClient.send({ cmd: 'get-bids-by-auction' }, { auctionId: id }),
    );
    const bids = fetchedBids.bids.map(({ auctionId, ...rest }) => rest);
    const { lobbyWsUrl } = await firstValueFrom(
      this.natsClient.send({ cmd: 'get-auction-lobby' }, { auctionId: id }),
    );

    return { ...auction, lobbyWsUrl, bids };
  }

  async update(id: number, updateAuctionDto: UpdateAuctionDto) {
    const { item, startTimestamp, durationMinutes, ...auctionData } =
      updateAuctionDto;

    let _item = null;
    if (item) {
      _item = await this.itemRepository.findOne({ where: { name: item.name } });
      if (!_item) {
        _item = this.itemRepository.create(item);
        await this.itemRepository.save(_item);
      }
    } else {
      const auction = await this.auctionRepository.findOne({
        where: { id },
        relations: ['item'],
      });

      _item = await this.itemRepository.findOne({
        where: { id: auction.item.id },
      });
    }

    let start: any;
    let end: any;
    let auction: Auction;

    if (!startTimestamp) {
      auction = await this.auctionRepository.preload({
        id,
        ...auctionData,
        item: _item,
      });
    } else {
      start = this.validateStartTimestamp(startTimestamp);
      end = durationMinutes
        ? start.add(durationMinutes, 'minutes')
        : _item.endTimestamp;
      auction = await this.auctionRepository.preload({
        id,
        ...auctionData,
        startTimestamp: start.toISOString(),
        endTimestamp: end.toISOString(),
        item: _item,
      });

      if (!auction) {
        throw new NotFoundException(`Auction with ID ${id} not found.`);
      }
    }

    return this.auctionRepository.save(auction);
  }

  async remove(id: number) {
    const auction = await this.auctionRepository.findOne({ where: { id } });
    if (!auction) {
      throw new Error(`Auction with ID ${id} not found.`);
    }
    await this.auctionRepository.remove(auction);
    return { message: `Auction with ID ${id} removed successfully.` };
  }

  async close(id: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id, status: AuctionStatus.RUNNING },
    });

    if (!auction) {
      throw new NotFoundException(
        `Auction with ID ${id} not found or not running.`,
      );
    }

    const highestBids: FindBidsByAuctionResponse = await firstValueFrom(
      this.natsClient.send({ cmd: 'get-bids-by-auction' }, { auctionId: id }),
    );

    if (!highestBids) {
      throw new BadRequestException('No bids found for this auction.');
    }

    auction.status = AuctionStatus.CLOSED;
    if (highestBids.bids && highestBids.bids.length > 0) {
      auction.winnerId = highestBids.bids[0].bidderId;
      auction.winningFinalAmount = highestBids.bids[0].amount;
    }

    await this.auctionRepository.save(auction);

    return {
      auctionId: id,
      winnerId: auction.winnerId,
      finalPrice: auction.winningFinalAmount,
      message: 'Auction closed successfully',
    };
  }

  async isAuctionRunning(auctionId: number) {
    const auction = await this.findOne(auctionId);
    const now = dayjs().add(2, 'hour').toISOString();
    const start = dayjs(auction.startTimestamp);
    const end = dayjs(auction.endTimestamp);

    return { running: start.isBefore(now) && dayjs(now).isBefore(end) };
  }

  private validateStartTimestamp(startTimestamp: string) {
    const now = dayjs().add(2, 'hour').toISOString();
    const start = dayjs(startTimestamp);

    if (start.isBefore(now)) {
      throw new BadRequestException('Start time must be in the future or now.');
    }

    return start;
  }
}
