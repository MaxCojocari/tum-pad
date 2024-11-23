import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HealthModule } from './health/health.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { configurationSchema } from './config/configuration.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtlModule } from './etl/etl.module';

@Global()
@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configurationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'auction',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.auction.host'),
        port: configService.get<number>('database.auction.port'),
        username: configService.get<string>('database.auction.user'),
        password: configService.get<string>('database.auction.password'),
        database: configService.get<string>('database.auction.db'),
        synchronize: false,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'bidder',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.bidder.host'),
        port: configService.get<number>('database.bidder.port'),
        username: configService.get<string>('database.bidder.user'),
        password: configService.get<string>('database.bidder.password'),
        database: configService.get<string>('database.bidder.db'),
        synchronize: false,
      }),
    }),
    MongooseModule.forRootAsync({
      connectionName: 'bidder',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.bidder.uri'),
      }),
    }),
    MongooseModule.forRootAsync({
      connectionName: 'dataWarehouse',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.dataWarehouse.uri'),
      }),
    }),
    EtlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
