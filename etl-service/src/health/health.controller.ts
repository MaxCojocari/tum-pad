import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectDataSource('auction')
    private auctionDataSource: DataSource,
    @InjectDataSource('bidder')
    private bidderDataSource: DataSource,
    @InjectConnection('dataWarehouse')
    private warehouseDataSource: DataSource,
    @InjectConnection('bidder')
    private bidderMongoDataSource: DataSource,
    private mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        this.db.pingCheck('auction-pg', {
          connection: this.auctionDataSource,
        }),
      () =>
        this.db.pingCheck('bidder-pg', {
          connection: this.bidderDataSource,
        }),
      () =>
        this.mongoose.pingCheck('bidder-mongodb', {
          connection: this.bidderMongoDataSource,
        }),
      () =>
        this.mongoose.pingCheck('data-warehouse-mongodb', {
          connection: this.warehouseDataSource,
        }),
    ]);
  }
}
