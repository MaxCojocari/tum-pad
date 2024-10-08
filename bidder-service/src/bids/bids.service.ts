import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';
import { AuctionsServiceGrpc } from './interfaces/auction-service.interface';
import { ClientGrpc } from '@nestjs/microservices';
import * as dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BidsService implements OnModuleInit {
  private auctionsService: AuctionsServiceGrpc;

  constructor(
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
    @Inject('AUCTION_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.auctionsService =
      this.client.getService<AuctionsServiceGrpc>('AuctionsService');
  }

  async create(createBidDto: CreateBidDto) {
    const isRunning = await firstValueFrom(
      this.auctionsService.isAuctionRunning({
        auctionId: createBidDto.auctionId,
      }),
    );

    if (!isRunning.running) {
      throw new BadRequestException(
        `Auction with id ${createBidDto.auctionId} is not running.`,
      );
    }

    const bid = this.bidsRepository.create(createBidDto);
    return this.bidsRepository.save(bid);
  }

  findAll() {
    return this.bidsRepository.find();
  }

  async findBidsByAuction(auctionId: number) {
    const bids = await this.bidsRepository.find({
      where: { auctionId },
      order: { amount: 'DESC' },
    });
    const bidsWithIsoTimestamp = bids.map((bid) => ({
      ...bid,
      timestamp: dayjs(bid.timestamp.toISOString())
        .add(3, 'hour')
        .toISOString(),
    }));

    return { bids: bidsWithIsoTimestamp };
  }

  async findOne(id: number) {
    const bid = await this.bidsRepository.findOne({ where: { id } });
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
    return bid;
  }

  async update(id: number, updateBidDto: UpdateBidDto) {
    const bid = await this.findOne(id);
    Object.assign(bid, updateBidDto);
    return this.bidsRepository.save(bid);
  }

  async remove(id: number) {
    const bid = await this.findOne(id);
    await this.bidsRepository.remove(bid);
    return { message: `Bid with ID ${id} removed successfully.` };
  }

  createLobby(auctionId: number) {
    console.log(`createLobby ${auctionId}`);
    // initiate ws connection
    return { message: 'Ok' };
  }
}
