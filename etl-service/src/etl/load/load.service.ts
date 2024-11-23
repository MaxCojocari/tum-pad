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
    await this.auctionModel.insertMany(data);
  }

  async loadItems(data: any[]) {
    await this.itemModel.insertMany(data);
  }

  async loadBids(data: any[]) {
    await this.bidModel.insertMany(data);
  }

  async loadBidders(data: any[]) {
    await this.bidderModel.insertMany(data);
  }

  async loadLobbies(data: any[]) {
    await this.lobbyModel.insertMany(data);
  }
}
