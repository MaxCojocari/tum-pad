import { Module } from '@nestjs/common';
import { ExtractService } from './extract.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Bidder, BidderSchema } from '../entities/bidder.entity';
import { Item } from '../entities/item.entity';
import { Lobby } from '../entities/lobby.entity';
import {
  LastProcessedId,
  LastProcessedIdSchema,
} from '../schemas/lastProcessedId.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Item], 'auction'),
    TypeOrmModule.forFeature([Bid, Lobby], 'bidder'),
    MongooseModule.forFeature(
      [
        {
          name: Bidder.name,
          schema: BidderSchema,
        },
      ],
      'bidder',
    ),
    MongooseModule.forFeature(
      [
        {
          name: LastProcessedId.name,
          schema: LastProcessedIdSchema,
        },
      ],
      'dataWarehouse',
    ),
  ],
  providers: [ExtractService],
  exports: [ExtractService],
})
export class ExtractModule {}
