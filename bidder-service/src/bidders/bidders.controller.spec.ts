import { Test, TestingModule } from '@nestjs/testing';
import { BiddersController } from './bidders.controller';
import { BiddersService } from './bidders.service';
import { CreateBidderDto } from './dto/create-bidder.dto';
import { UpdateBidderDto } from './dto/update-bidder.dto';

const mockBiddersService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findAllByBidder: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('BiddersController', () => {
  let controller: BiddersController;
  let service: jest.Mocked<BiddersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiddersController],
      providers: [
        { provide: BiddersService, useValue: mockBiddersService() }, // Explicitly mock service methods
      ],
    }).compile();

    controller = module.get<BiddersController>(BiddersController);
    service = module.get<BiddersService>(BiddersService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call biddersService.create with the correct data', async () => {
      const createBidderDto: CreateBidderDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const createdBidder = { id: 1, ...createBidderDto };

      service.create.mockResolvedValue(createdBidder as any);

      const result = await controller.create(createBidderDto);

      expect(service.create).toHaveBeenCalledWith(createBidderDto);
      expect(result).toEqual(createdBidder);
    });
  });

  describe('findAll', () => {
    it('should call biddersService.findAll and return an array of bidders', async () => {
      const bidders = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
      service.findAll.mockResolvedValue(bidders as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(bidders);
    });
  });

  describe('findOne', () => {
    it('should call biddersService.findOne with the correct id', async () => {
      const bidder = { id: 1, name: 'John Doe', email: 'john@example.com' };
      service.findOne.mockResolvedValue(bidder as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(bidder);
    });
  });

  describe('findBidsByBidder', () => {
    it('should call biddersService.findAllByBidder with the correct bidder id', async () => {
      const bidderId = 1;
      const bids = [
        { id: 1, auctionId: 10, bidderId: 1, amount: 100 },
        { id: 2, auctionId: 20, bidderId: 1, amount: 200 },
      ];
      service.findAllByBidder.mockResolvedValue(bids as any);

      const result = await controller.findBidsByBidder(bidderId);

      expect(service.findAllByBidder).toHaveBeenCalledWith(bidderId);
      expect(result).toEqual(bids);
    });
  });

  describe('update', () => {
    it('should call biddersService.update with the correct id and data', async () => {
      const updateBidderDto: UpdateBidderDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const updatedBidder = { id: 1, ...updateBidderDto };

      service.update.mockResolvedValue(updatedBidder as any);

      const result = await controller.update(1, updateBidderDto);

      expect(service.update).toHaveBeenCalledWith(1, updateBidderDto);
      expect(result).toEqual(updatedBidder);
    });
  });

  describe('remove', () => {
    it('should call biddersService.remove with the correct id', async () => {
      const removeMessage = {
        message: 'Bidder with ID 1 removed successfully.',
      };
      service.remove.mockResolvedValue(removeMessage as any);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(removeMessage);
    });
  });
});
