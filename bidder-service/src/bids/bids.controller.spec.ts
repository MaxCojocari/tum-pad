import { Test, TestingModule } from '@nestjs/testing';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

const mockBidsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createLobby: jest.fn(),
  findBidsByAuction: jest.fn(),
});

describe('BidsController', () => {
  let controller: BidsController;
  let service: jest.Mocked<BidsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidsController],
      providers: [{ provide: BidsService, useValue: mockBidsService() }],
    }).compile();

    controller = module.get<BidsController>(BidsController);
    service = module.get<BidsService>(BidsService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call bidsService.create with the correct data', async () => {
      const createBidDto: CreateBidDto = {
        auctionId: 1,
        bidderId: 2,
        amount: 100,
      };
      const createdBid = { id: 1, ...createBidDto } as any;

      service.create.mockResolvedValueOnce(createdBid);

      const result = await controller.create(createBidDto);

      expect(service.create).toHaveBeenCalledWith(createBidDto);
      expect(result).toEqual(createdBid);
    });
  });

  describe('findAll', () => {
    it('should call bidsService.findAll and return an array of bids', async () => {
      const bids = [{ id: 1, auctionId: 1, bidderId: 1, amount: 100 }];
      service.findAll.mockResolvedValueOnce(bids as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(bids);
    });
  });

  describe('findOne', () => {
    it('should call bidsService.findOne with the correct id', async () => {
      const bid = { id: 1, auctionId: 1, bidderId: 1, amount: 100 };
      service.findOne.mockResolvedValueOnce(bid as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(bid);
    });
  });

  describe('update', () => {
    it('should call bidsService.update with the correct id and updateBidDto', async () => {
      const updateBidDto: UpdateBidDto = { amount: 150 };
      const updatedBid = { id: 1, auctionId: 1, bidderId: 1, amount: 150 };

      service.update.mockResolvedValueOnce(updatedBid as any);

      const result = await controller.update(1, updateBidDto);

      expect(service.update).toHaveBeenCalledWith(1, updateBidDto);
      expect(result).toEqual(updatedBid);
    });
  });

  describe('remove', () => {
    it('should call bidsService.remove with the correct id and return success message', async () => {
      const removeMessage = { message: 'Bid with ID 1 removed successfully.' };

      service.remove.mockResolvedValueOnce(removeMessage);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(removeMessage);
    });
  });

  describe('createLobby', () => {
    it('should call bidsService.createLobby with the correct auctionId', async () => {
      const auctionId = 1;

      service.createLobby.mockReturnValueOnce({ message: 'Ok' });

      const result = controller.createLobby({ auctionId });

      expect(service.createLobby).toHaveBeenCalledWith(auctionId);
      expect(result).toEqual({ message: 'Ok' });
    });
  });

  describe('findBidsByAuction', () => {
    it('should call bidsService.findBidsByAuction with the correct auctionId', async () => {
      const auctionId = 1;
      const bids = [{ id: 1, auctionId: 1, bidderId: 1, amount: 100 }];

      service.findBidsByAuction.mockResolvedValueOnce({ bids } as any);

      const result = await controller.findBidsByAuction({ auctionId } as any);

      expect(service.findBidsByAuction).toHaveBeenCalledWith(auctionId);
      expect(result).toEqual({ bids });
    });
  });
});
