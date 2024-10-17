import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { Item } from './entities/item.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuctionsJob } from './auctions.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Item]),
    ClientsModule.register([
      {
        name: 'BIDDER_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
          queue: 'transporter_queue',
        },
      },
    ]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
})
export class AuctionsModule {}
