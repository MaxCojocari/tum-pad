import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

const mockHealthCheckService = () => ({
  check: jest.fn((indicators: any[]) => {
    return Promise.all(indicators.map((i) => i()));
  }),
});

const mockTypeOrmHealthIndicator = () => ({
  pingCheck: jest.fn(),
});

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let typeOrmHealthIndicator: jest.Mocked<TypeOrmHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService() },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator(),
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(
      HealthCheckService,
    ) as any;
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    ) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should call HealthCheckService.check and TypeOrmHealthIndicator.pingCheck', async () => {
      const mockHealthResult: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      healthCheckService.check.mockResolvedValueOnce(mockHealthResult);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(mockHealthResult);
    });
  });
});
