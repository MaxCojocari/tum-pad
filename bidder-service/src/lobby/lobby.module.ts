import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './lobby.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../bids/entities/bid.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    ClientsModule.registerAsync([
      {
        name: 'AUCTION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
            queue: 'transporter_queue',
          },
        }),
      },
    ]),
  ],
  providers: [LobbyGateway, LobbyService],
  exports: [LobbyGateway],
})
export class LobbyModule {}
