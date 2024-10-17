import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './lobby.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Lobby } from './entities/lobby.entity';
import { LobbyController } from './lobby.controller';
import { Bid } from '../bids/entities/bid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Lobby]),
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
  ],
  providers: [LobbyGateway, LobbyService],
  exports: [LobbyGateway],
  controllers: [LobbyController],
})
export class LobbyModule {}
