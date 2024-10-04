import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { of } from 'rxjs';
import { Bid } from './entities/bid.entity';

const mockBidsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

const mockAuctionsServiceGrpc = () => ({
  isAuctionRunning: jest.fn(),
});

const mockClientGrpc = () => ({
  getService: jest.fn(() => mockAuctionsServiceGrpc()),
});

describe('BidsService', () => {
  let service: BidsService;
  let bidsRepository: jest.Mocked<Repository<Bid>>;
  let auctionsService: jest.Mocked<any>;
  let clientGrpc: jest.Mocked<ClientGrpc>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: getRepositoryToken(Bid), useFactory: mockBidsRepository },
        { provide: 'AUCTION_PACKAGE', useFactory: mockClientGrpc },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
    bidsRepository = module.get<jest.Mocked<Repository<Bid>>>(
      getRepositoryToken(Bid),
    );
    clientGrpc = module.get<ClientGrpc>('AUCTION_PACKAGE') as any;

    auctionsService = clientGrpc.getService('AuctionsService');

    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an exception if the auction is not running', async () => {
      const createBidDto: CreateBidDto = {
        auctionId: 1,
        bidderId: 2,
        amount: 100,
      };

      auctionsService.isAuctionRunning.mockReturnValueOnce(
        of({ running: false }),
      );

      await expect(service.create(createBidDto)).rejects.toThrow();
    });

    it('should save a bid if the auction is running', async () => {
      const createBidDto: CreateBidDto = {
        auctionId: 1,
        bidderId: 2,
        amount: 100,
      };
      const createdBid = { id: 1, ...createBidDto };

      auctionsService.isAuctionRunning.mockReturnValueOnce(
        of({ running: true }),
      );
      bidsRepository.create.mockReturnValue(createdBid as any);
      bidsRepository.save.mockResolvedValue(createdBid as any);

      expect(bidsRepository.create);
      expect(bidsRepository.save);
    });
  });

  describe('findAll', () => {
    it('should return all bids', async () => {
      const bids = [{ id: 1, auctionId: 1, bidderId: 1, amount: 100 }];
      bidsRepository.find.mockResolvedValueOnce(bids as any);

      const result = await service.findAll();

      expect(bidsRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bids);
    });
  });

  describe('findBidsByAuction', () => {
    it('should return bids by auction id, sorted by amount in descending order', async () => {
      const auctionId = 1;
      const bids = [
        { id: 1, auctionId, bidderId: 1, amount: 100, timestamp: new Date() },
        { id: 2, auctionId, bidderId: 2, amount: 200, timestamp: new Date() },
      ];

      bidsRepository.find.mockResolvedValueOnce(bids as any);

      const result = await service.findBidsByAuction(auctionId);

      expect(bidsRepository.find).toHaveBeenCalledWith({
        where: { auctionId },
        order: { amount: 'DESC' },
      });
      expect(result);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if the bid does not exist', async () => {
      bidsRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Bid with ID 1 not found'),
      );
    });

    it('should return the bid if it exists', async () => {
      const bid = { id: 1, auctionId: 1, bidderId: 1, amount: 100 };
      bidsRepository.findOne.mockResolvedValueOnce(bid as any);

      const result = await service.findOne(1);

      expect(bidsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(bid);
    });
  });

  describe('update', () => {
    it('should update and return the bid', async () => {
      const bid = { id: 1, auctionId: 1, bidderId: 1, amount: 100 };
      const updateBidDto: UpdateBidDto = { amount: 150 };

      bidsRepository.findOne.mockResolvedValueOnce(bid as any);
      bidsRepository.save.mockResolvedValueOnce({
        ...bid,
        ...updateBidDto,
      } as any);

      const result = await service.update(1, updateBidDto);

      expect(bidsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bidsRepository.save).toHaveBeenCalledWith({
        ...bid,
        ...updateBidDto,
      });
      expect(result).toEqual({ ...bid, ...updateBidDto });
    });
  });

  describe('remove', () => {
    it('should remove the bid and return a success message', async () => {
      const bid = { id: 1, auctionId: 1, bidderId: 1, amount: 100 };

      bidsRepository.findOne.mockResolvedValueOnce(bid as any);

      const result = await service.remove(1);

      expect(bidsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bidsRepository.remove).toHaveBeenCalledWith(bid);
      expect(result).toEqual({
        message: `Bid with ID 1 removed successfully.`,
      });
    });

    it('should throw NotFoundException if the bid does not exist', async () => {
      bidsRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('Bid with ID 1 not found'),
      );
    });
  });
});
