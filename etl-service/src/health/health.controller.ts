import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { InjectConnection, InjectDataSource } from '@nestjs/typeorm';
import { Connection, DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectDataSource('auction')
    private auctionDataSource: DataSource,
    @InjectDataSource('bidder')
    private bidderDataSource: DataSource,
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
      () => this.mongoose.pingCheck('mongodb'),
    ]);
  }
}
