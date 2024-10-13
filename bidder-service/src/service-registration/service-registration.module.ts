import { Module } from '@nestjs/common';
import { ServiceRegistrationService } from './service-registration.service';
import { ServiceRegistrationController } from './service-registration.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'SERVICE_REGISTRY_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'service_registry',
            protoPath: join(__dirname, '../proto/serviceRegistry.proto'),
            url: configService.get<string>('serviceRegistryGrpc.url'),
          },
        }),
      },
    ]),
  ],
  controllers: [ServiceRegistrationController],
  providers: [ServiceRegistrationService],
})
export class ServiceRegistrationModule {}
