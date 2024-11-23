import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auction } from '../schemas/auction.schema';
import { Bid } from '../schemas/bid.schema';
import { Item } from '../schemas/item.schema';
import { Bidder } from '../schemas/bidder.schema';
import { Lobby } from '../schemas/lobby.schema';

@Injectable()
export class LoadService {
  constructor(
    @InjectModel(Auction.name, 'dataWarehouse')
    private auctionModel: Model<Auction>,
    @InjectModel(Item.name, 'dataWarehouse') private itemModel: Model<Item>,
    @InjectModel(Bid.name, 'dataWarehouse') private bidModel: Model<Bid>,
    @InjectModel(Bidder.name, 'dataWarehouse')
    private bidderModel: Model<Bidder>,
    @InjectModel(Lobby.name, 'dataWarehouse') private lobbyModel: Model<Lobby>,
  ) {}

  async loadAuctions(data: any[]) {
    for (const auction of data) {
      await this.auctionModel.updateOne(
        { id: auction.id },
        { $set: auction },
        { upsert: true },
      );
    }
  }

  async loadItems(data: any[]) {
    for (const item of data) {
      await this.itemModel.updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true },
      );
    }
  }

  async loadBids(data: any[]) {
    for (const bid of data) {
      await this.bidModel.updateOne(
        { id: bid.id },
        { $set: bid },
        { upsert: true },
      );
    }
  }

  async loadBidders(data: any[]) {
    for (const bidder of data) {
      await this.bidderModel.updateOne(
        { email: bidder.email },
        { $set: bidder },
        { upsert: true },
      );
    }
  }

  async loadLobbies(data: any[]) {
    for (const lobby of data) {
      await this.lobbyModel.updateOne(
        { id: lobby.id },
        { $set: lobby },
        { upsert: true },
      );
    }
  }
}
