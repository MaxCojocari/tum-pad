import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRegistrationController } from './service-registration.controller';
import { ServiceRegistrationService } from './service-registration.service';

describe('ServiceRegistrationController', () => {
  let controller: ServiceRegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceRegistrationController],
      providers: [ServiceRegistrationService],
    }).compile();

    controller = module.get<ServiceRegistrationController>(ServiceRegistrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
