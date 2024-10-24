import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LobbyModule } from '../lobby/lobby.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
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
    LobbyModule,
  ],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
