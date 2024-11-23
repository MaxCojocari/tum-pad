import { Module } from '@nestjs/common';
import { LoadService } from './load.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Bidder, BidderSchema } from '../entities/bidder.entity';
import { Item } from '../entities/item.entity';
import { Lobby } from '../entities/lobby.entity';
import { AuctionSchema } from '../schemas/auction.schema';
import { BidSchema } from '../schemas/bid.schema';
import { ItemSchema } from '../schemas/item.schema';
import { LobbySchema } from '../schemas/lobby.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Auction.name,
          schema: AuctionSchema,
        },
        {
          name: Bid.name,
          schema: BidSchema,
        },
        {
          name: Bidder.name,
          schema: BidderSchema,
        },
        {
          name: Item.name,
          schema: ItemSchema,
        },
        {
          name: Lobby.name,
          schema: LobbySchema,
        },
      ],
      'dataWarehouse',
    ),
  ],
  providers: [LoadService],
  exports: [LoadService],
})
export class LoadModule {}
