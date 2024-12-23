import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { delay, of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Controller()
export class AppController {
  private readonly host: string;
  private readonly port: number;

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @InjectMetric('auction_ping_calls_total')
    private readonly endpointCounter: Counter<string>,
  ) {
    this.host = this.configService.get<string>('app.host');
    this.port = this.configService.get<number>('app.port');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/timeout')
  testTimeout() {
    return of('This is slow').pipe(delay(6000));
  }

  @Get('/ping')
  getPing() {
    this.endpointCounter.inc();

    const now = dayjs().add(2, 'hour').toISOString();
    console.log(`Pong from instance ${this.host}:${this.port}`);

    return {
      message: `Pong from instance ${this.host}:${this.port}`,
      timestamp: now,
    };
  }

  @Get('/ping-with-errors')
  getPingWithErrors() {
    console.log(`Pinged with error instance ${this.host}:${this.port}`);

    throw new HttpException(
      `Service ${this.host}:${this.port} failed!`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
