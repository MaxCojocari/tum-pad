import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BIDDER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'bidder',
          protoPath: join(__dirname, '../../proto/bidder.proto'),
          url: 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
