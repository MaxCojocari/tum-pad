import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ServiceRegistrationService } from './service-registration/service-registration.service';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const host = configService.get<string>('app.host');
  const port = configService.get<number>('app.port');
  const reqTimeout = configService.get<number>('app.reqTimeout');
  const nats = {
    host: configService.get<string>('nats.host'),
    port: configService.get<number>('nats.port'),
  };
  const logger = new Logger(NestApplication.name);

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
      servers: [`nats://${nats.host}:${nats.port}`],
      queue: 'transporter_queue',
    },
  });

  app.useGlobalInterceptors(new TimeoutInterceptor(reqTimeout));
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: ${await app.getUrl()}`);

  const serviceRegistrationService = app.get(ServiceRegistrationService);
  await serviceRegistrationService.registerService(
    'bidder-service',
    host,
    port,
  );
}
bootstrap();
