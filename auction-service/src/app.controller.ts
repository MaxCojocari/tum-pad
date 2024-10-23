import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { delay, of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

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
    const host = this.configService.get<string>('app.host');
    const port = this.configService.get<string>('app.port');
    const now = dayjs().add(3, 'hour').toISOString();
    return {
      message: `Pong from instance ${host}:${port}`,
      timestamp: now,
    };
  }
}
