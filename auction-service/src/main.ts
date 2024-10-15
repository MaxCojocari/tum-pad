import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ServiceRegistrationService } from './service-registration/service-registration.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const host = configService.get<string>('app.host');
  const port = configService.get<number>('app.port');
  const logger = new Logger(NestApplication.name);
  const rmq = {
    host: configService.get<string>('rmq.host'),
    port: configService.get<number>('rmq.port'),
    user: configService.get<number>('rmq.user'),
    password: configService.get<number>('rmq.password'),
  };

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
      queue: 'transporter_queue',
    },
  });

  app.useGlobalInterceptors(new TimeoutInterceptor());

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);

  const serviceRegistrationService = app.get(ServiceRegistrationService);
  await serviceRegistrationService.registerService(
    'auction-service',
    host,
    port,
  );
}
bootstrap();
