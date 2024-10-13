import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { configurationSchema } from './config/configuration.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { HealthModule } from './health/health.module';
import { AuctionsModule } from './auctions/auctions.module';
import * as redisStore from 'cache-manager-ioredis';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceRegistrationModule } from './service-registration/service-registration.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configurationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('redis.host'),
        port: configService.get<string>('redis.port'),
        ttl: 10,
        isGlobal: true,
      }),
    }),
    HealthModule,
    ScheduleModule.forRoot(),
    AuctionsModule,
    ServiceRegistrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [CacheModule],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log({
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.user'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.db'),
      redisHost: this.configService.get<string>('redis.host'),
      redisPort: this.configService.get<string>('redis.port'),
    });
  }
}
