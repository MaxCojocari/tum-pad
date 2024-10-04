import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from './entities/auction.entity';
import { Item } from './entities/item.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuctionsJob } from './auctions.job';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Item]),
    ClientsModule.registerAsync([
      {
        name: 'BIDDER_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'bids',
            protoPath: join(__dirname, '../proto/bids.proto'),
            url: configService.get<string>('bidsServiceGrpc.url'),
          },
        }),
      },
    ]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
})
export class AuctionsModule {}
