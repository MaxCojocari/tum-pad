import { Controller } from '@nestjs/common';
import { ServiceRegistrationService } from './service-registration.service';

@Controller()
export class ServiceRegistrationController {
  constructor(private readonly serviceRegistrationService: ServiceRegistrationService) {}
}
