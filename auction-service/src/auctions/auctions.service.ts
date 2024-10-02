import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Item } from './entities/item.entity';
import * as dayjs from 'dayjs';
import { AuctionStatus } from './interfaces/auction-status.enum';
import { ClientGrpc } from '@nestjs/microservices';
import { BidderService } from './interfaces/bidder-service.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuctionsService implements OnModuleInit {
  private bidderService: BidderService;

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @Inject('BIDDER_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.bidderService = this.client.getService<BidderService>('BidderService');
  }

  async create(createAuctionDto: CreateAuctionDto) {
    const { item, startTimestamp, duration, ...auctionData } = createAuctionDto;

    let _item = await this.itemRepository.findOne({
      where: { name: item.name },
    });

    if (!_item) {
      _item = this.itemRepository.create(item);
      await this.itemRepository.save(_item);
    }

    const start = this.validateStartTimestamp(startTimestamp);
    const end = start.add(duration, 'minutes');

    const auction = this.auctionRepository.create({
      ...auctionData,
      item: _item,
      startTimestamp: start.toISOString(),
      endTimestamp: end.toISOString(),
      status: AuctionStatus.CREATED,
    });

    // await firstValueFrom(this.bidderService.createLobby({ auctionId: id }));

    return this.auctionRepository.save(auction);
  }

  findAll() {
    return this.auctionRepository.find({ relations: ['item'] });
  }

  findOne(id: number) {
    return this.auctionRepository.findOne({
      where: { id },
      relations: { item: true },
    });
  }

  async update(id: number, updateAuctionDto: UpdateAuctionDto) {
    const { item, startTimestamp, duration, ...auctionData } = updateAuctionDto;

    let _item = null;
    if (item) {
      _item = await this.itemRepository.findOne({ where: { name: item.name } });
      if (!_item) {
        _item = this.itemRepository.create(item);
        await this.itemRepository.save(_item);
      }
    }

    const start = this.validateStartTimestamp(startTimestamp);
    const end = duration ? start.add(duration, 'minutes') : _item.endTimestamp;

    const auction = await this.auctionRepository.preload({
      id,
      ...auctionData,
      startTimestamp: start.toISOString(),
      endTimestamp: end.toISOString(),
      item: _item,
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    return this.auctionRepository.save(auction);
  }

  async remove(id: number) {
    const auction = await this.auctionRepository.findOne({ where: { id } });
    if (!auction) {
      throw new Error(`Auction with ID ${id} not found.`);
    }
    await this.auctionRepository.remove(auction);
  }

  async close(id: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id, status: AuctionStatus.RUNNING },
      relations: ['item'],
    });

    if (!auction) {
      throw new NotFoundException(
        `Auction with ID ${id} not found or not running.`,
      );
    }

    // const highestBid = await this.bidRepository.findOne({
    //   where: { auction: auction },
    //   order: { bidAmount: 'DESC' },
    // });

    // TODO: grpc method
    const highestBid = { bidderId: 1, bidAmount: 2 };

    if (!highestBid) {
      throw new BadRequestException('No bids found for this auction.');
    }

    auction.status = AuctionStatus.CLOSED;
    await this.auctionRepository.save(auction);

    return {
      auctionId: id,
      winnerId: highestBid.bidderId,
      finalPrice: highestBid.bidAmount,
    };
  }

  private validateStartTimestamp(startTimestamp: string) {
    const now = dayjs();
    const start = dayjs(startTimestamp);

    if (start.isBefore(now)) {
      throw new BadRequestException('Start time must be in the future or now.');
    }

    return start;
  }
}
