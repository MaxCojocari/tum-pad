import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    ClientsModule.registerAsync([
      {
        name: 'AUCTION_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auction',
            protoPath: join(__dirname, '../proto/auction.proto'),
            url: configService.get<string>('auctionServiceGrpc.url'),
          },
        }),
      },
    ]),
  ],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
