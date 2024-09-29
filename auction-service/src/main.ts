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
      package: 'auction',
      protoPath: join(__dirname, '../../proto/auction.proto'),
      url: 'localhost:50051',
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
