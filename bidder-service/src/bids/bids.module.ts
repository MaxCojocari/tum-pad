import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LobbyModule } from '../lobby/lobby.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    ClientsModule.register([
      {
        name: 'AUCTION_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
          queue: 'transporter_queue',
        },
      },
    ]),
    LobbyModule,
  ],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
