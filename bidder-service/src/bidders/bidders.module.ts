import { Module } from '@nestjs/common';
import { BiddersService } from './bidders.service';
import { BiddersController } from './bidders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bidder } from './entities/bidder.entity';
import { Bid } from '../bids/entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bidder, Bid])],
  controllers: [BiddersController],
  providers: [BiddersService],
})
export class BiddersModule {}
