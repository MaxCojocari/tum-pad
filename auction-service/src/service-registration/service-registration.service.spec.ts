import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRegistrationService } from './service-registration.service';

describe('ServiceRegistrationService', () => {
  let service: ServiceRegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceRegistrationService],
    }).compile();

    service = module.get<ServiceRegistrationService>(ServiceRegistrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
