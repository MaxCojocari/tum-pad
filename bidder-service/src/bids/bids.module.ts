import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
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
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
