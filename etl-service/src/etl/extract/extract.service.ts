import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Item } from '../entities/item.entity';
import { Lobby } from '../entities/lobby.entity';
import { Bidder } from '../entities/bidder.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExtractService {
  constructor(
    @InjectRepository(Auction, 'auction')
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Item, 'auction')
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Bid, 'bidder')
    private readonly bidRepository: Repository<Bid>,
    @InjectModel(Bidder.name, 'bidder')
    private readonly bidderModel: Model<Bidder>,
    @InjectRepository(Lobby, 'bidder')
    private readonly lobbyRepository: Repository<Lobby>,
  ) {}

  extractAuctions() {
    return this.auctionRepository.find({ relations: ['item'] });
  }

  extractItems() {
    return this.itemRepository.find();
  }

  extractBids() {
    return this.bidRepository.find();
  }

  extractBidders() {
    return this.bidderModel.find().exec();
  }

  extractLobbies() {
    return this.lobbyRepository.find();
  }
}
