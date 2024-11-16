import { Module } from '@nestjs/common';
import { BiddersService } from './bidders.service';
import { BiddersController } from './bidders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bidder, BidderSchema } from './entities/bidder.entity';
import { Bid } from '../bids/entities/bid.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    MongooseModule.forFeature([
      {
        name: Bidder.name,
        schema: BidderSchema,
      },
    ]),
  ],
  controllers: [BiddersController],
  providers: [BiddersService],
})
export class BiddersModule {}
