import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ServiceRegistryGrpc } from './interfaces/service-registry.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ServiceRegistrationService implements OnModuleInit {
  private serviceRegistry: ServiceRegistryGrpc;
  private logger = new Logger(ServiceRegistrationService.name);

  constructor(
    @Inject('SERVICE_REGISTRY_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.serviceRegistry =
      this.client.getService<ServiceRegistryGrpc>('ServiceRegistry');
  }

  async registerService(serviceName: string, host: string, port: number) {
    const maxRetries = 10;
    let retryCount = 0;
    let registered = false;

    while (retryCount < maxRetries && !registered) {
      try {
        const res = await firstValueFrom(
          this.serviceRegistry.register({ serviceName, host, port }),
        );
        registered = true;
        this.logger.log(`Successfully registered service as ${host}:${port}`);
      } catch (error) {
        retryCount++;
        this.logger.error(
          `Failed to register service. Retry attempt ${retryCount} of ${maxRetries}`,
          error.stack,
        );

        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds before retrying
        } else {
          this.logger.error(
            'Service registration failed after maximum retries',
          );
        }
      }
    }
  }
}
