import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MoreThan, Repository } from 'typeorm';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Item } from '../entities/item.entity';
import { Lobby } from '../entities/lobby.entity';
import { Bidder } from '../entities/bidder.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LastProcessedId } from '../schemas/lastProcessedId.schema';

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
    @InjectModel(LastProcessedId.name, 'dataWarehouse')
    private readonly lastProcessedIdModel: Model<LastProcessedId>,
  ) {}

  async getLastProcessedId(entityName: string) {
    const record = await this.lastProcessedIdModel
      .findOne({ entityName })
      .exec();
    return record?.lastProcessedId || '0';
  }

  async updateLastProcessedId(entityName: string, lastId: string) {
    await this.lastProcessedIdModel.updateOne(
      { entityName },
      { $set: { lastProcessedId: lastId } },
      { upsert: true },
    );
  }

  async extractAuctions() {
    const newAuctions = await this.auctionRepository.find({
      relations: ['item'],
    });

    return newAuctions;
  }

  async extractBids() {
    const lastProcessedId = parseInt(await this.getLastProcessedId('Bid'), 10);

    const newBids = await this.bidRepository.find({
      where: { id: MoreThan(lastProcessedId) },
    });

    if (newBids.length > 0) {
      const maxId = Math.max(...newBids.map((bid) => bid.id));
      await this.updateLastProcessedId('Bid', maxId.toString());
    }

    return newBids;
  }

  async extractBidders() {
    const lastProcessedId = await this.getLastProcessedId('Bidder');

    let newBidders: any[];

    if (lastProcessedId === '0') {
      newBidders = await this.bidderModel.find().exec();
    } else {
      newBidders = await this.bidderModel
        .find({ _id: { $gt: lastProcessedId } })
        .exec();
    }

    if (newBidders.length > 0) {
      const maxId = newBidders[newBidders.length - 1]._id.toString();
      await this.updateLastProcessedId('Bidder', maxId);
    }

    return newBidders;
  }

  async extractItems() {
    const lastProcessedId = parseInt(await this.getLastProcessedId('Item'), 10);

    const newItems = await this.itemRepository.find({
      where: { id: MoreThan(lastProcessedId) },
      relations: ['auction'],
    });

    if (newItems.length > 0) {
      const maxId = Math.max(...newItems.map((item) => item.id));
      await this.updateLastProcessedId('Item', maxId.toString());
    }

    return newItems;
  }

  async extractLobbies() {
    const lastProcessedId = parseInt(
      await this.getLastProcessedId('Lobby'),
      10,
    );

    const newLobbies = await this.lobbyRepository.find({
      where: { id: MoreThan(lastProcessedId) },
    });

    if (newLobbies.length > 0) {
      const maxId = Math.max(...newLobbies.map((lobby) => lobby.id));
      await this.updateLastProcessedId('Lobby', maxId.toString());
    }

    return newLobbies;
  }
}
