import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    transport: Transport.GRPC,
    options: {
      package: 'bidder',
      protoPath: join(__dirname, './proto/bidder.proto'),
      url: 'localhost:50052',
    },
  });
  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
