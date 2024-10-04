import { Test, TestingModule } from '@nestjs/testing';
import { BiddersService } from './bidders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Bidder } from './entities/bidder.entity';
import { Bid } from '../bids/entities/bid.entity';

const mockBidderRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

const mockBidsRepository = () => ({
  find: jest.fn(),
});

describe('BiddersService', () => {
  let service: BiddersService;
  let bidderRepository: jest.Mocked<Repository<Bidder>>;
  let bidsRepository: jest.Mocked<Repository<Bid>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiddersService,
        {
          provide: getRepositoryToken(Bidder),
          useFactory: mockBidderRepository,
        },
        { provide: getRepositoryToken(Bid), useFactory: mockBidsRepository },
      ],
    }).compile();

    service = module.get<BiddersService>(BiddersService);
    bidderRepository = module.get(getRepositoryToken(Bidder));
    bidsRepository = module.get(getRepositoryToken(Bid));
  });

  describe('create', () => {
    it('should create and save a new bidder', async () => {
      const createBidderDto = { name: 'John Doe', email: 'john@example.com' };
      const createdBidder = { id: 1, ...createBidderDto };

      bidderRepository.create.mockReturnValue(createdBidder as any);
      bidderRepository.save.mockResolvedValue(createdBidder);

      const result = await service.create(createBidderDto);

      expect(bidderRepository.create).toHaveBeenCalledWith(createBidderDto);
      expect(bidderRepository.save).toHaveBeenCalledWith(createdBidder);
      expect(result).toEqual(createdBidder);
    });
  });

  describe('findAll', () => {
    it('should return all bidders', async () => {
      const bidders = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];
      bidderRepository.find.mockResolvedValue(bidders);

      const result = await service.findAll();

      expect(bidderRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bidders);
    });
  });

  describe('findAllByBidder', () => {
    it('should return all bids for a bidder', async () => {
      const bidderId = 1;
      const bids = [
        {
          id: 1,
          auctionId: 10,
          bidderId,
          amount: 100,
          timestamp: new Date(),
        },
        {
          id: 2,
          auctionId: 20,
          bidderId,
          amount: 200,
          timestamp: new Date(),
        },
      ];

      bidsRepository.find.mockResolvedValue(bids as any);

      const result = await service.findAllByBidder(bidderId);
      expect(bidsRepository.find).toHaveBeenCalledWith({ where: { bidderId } });
      expect(result).toEqual(bids);
    });
  });

  describe('findOne', () => {
    it('should return a bidder if it exists', async () => {
      const bidder = { id: 1, name: 'John', email: 'john@example.com' };
      bidderRepository.findOne.mockResolvedValue(bidder);

      const result = await service.findOne(1);

      expect(bidderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(bidder);
    });

    it('should throw NotFoundException if the bidder does not exist', async () => {
      bidderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(bidderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated bidder', async () => {
      const bidder = { id: 1, name: 'John', email: 'john@example.com' };
      const updateBidderDto = {
        name: 'Updated John',
        email: 'updated@example.com',
      };

      bidderRepository.findOne.mockResolvedValue(bidder);
      bidderRepository.save.mockResolvedValue({
        ...bidder,
        ...updateBidderDto,
      });

      const result = await service.update(1, updateBidderDto);

      expect(bidderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(bidderRepository.save).toHaveBeenCalledWith({
        ...bidder,
        ...updateBidderDto,
      });
      expect(result).toEqual({ ...bidder, ...updateBidderDto });
    });

    it('should throw NotFoundException if the bidder does not exist', async () => {
      bidderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { name: 'New Name', email: 'new@example.com' }),
      ).rejects.toThrow(NotFoundException);
      expect(bidderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('remove', () => {
    it('should remove a bidder', async () => {
      const bidder = { id: 1, name: 'John', email: 'john@example.com' };
      bidderRepository.findOne.mockResolvedValue(bidder);

      const result = await service.remove(1);

      expect(bidderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(bidderRepository.remove).toHaveBeenCalledWith(bidder);
      expect(result).toEqual({
        message: `Bidder with ID 1 removed successfully.`,
      });
    });

    it('should throw NotFoundException if the bidder does not exist', async () => {
      bidderRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(bidderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
