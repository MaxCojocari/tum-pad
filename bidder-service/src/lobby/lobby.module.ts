import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './lobby.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Lobby } from './entities/lobby.entity';
import { LobbyController } from './lobby.controller';
import { Bid } from '../bids/entities/bid.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Lobby]),
    ClientsModule.registerAsync([
      {
        name: 'AUCTION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [
              `nats://${configService.get<string>('nats.host')}:${configService.get<string>('nats.port')}`,
            ],
            queue: 'transporter_queue',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [LobbyGateway, LobbyService],
  exports: [LobbyGateway],
  controllers: [LobbyController],
})
export class LobbyModule {}
