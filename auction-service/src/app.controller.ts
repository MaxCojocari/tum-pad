import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { delay, of } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/timeout')
  testTimeout() {
    return of('This is slow').pipe(delay(6000));
  }
}
