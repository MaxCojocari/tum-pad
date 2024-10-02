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
            package: 'bidder',
            protoPath: join(__dirname, '../proto/bidder.proto'),
            url: configService.get<string>('bidderServiceGrpc.url'),
          },
        }),
      },
    ]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
})
export class AuctionsModule {}
