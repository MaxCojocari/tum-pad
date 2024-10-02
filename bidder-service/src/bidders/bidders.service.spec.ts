import { Test, TestingModule } from '@nestjs/testing';
import { BiddersService } from './bidders.service';

describe('BiddersService', () => {
  let service: BiddersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiddersService],
    }).compile();

    service = module.get<BiddersService>(BiddersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
