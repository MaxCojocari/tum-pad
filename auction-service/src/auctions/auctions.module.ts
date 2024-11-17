import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { Item } from './entities/item.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuctionsJob } from './auctions.job';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Item]),
    ClientsModule.registerAsync([
      {
        name: 'BIDDER_SERVICE',
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
    RedisModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
})
export class AuctionsModule {}
