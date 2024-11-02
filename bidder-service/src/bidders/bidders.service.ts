import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBidderDto } from './dto/create-bidder.dto';
import { UpdateBidderDto } from './dto/update-bidder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bidder } from './entities/bidder.entity';
import { Bid } from '../bids/entities/bid.entity';

@Injectable()
export class BiddersService {
  constructor(
    @InjectRepository(Bidder)
    private readonly bidderRepository: Repository<Bidder>,
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
  ) {}

  create(createBidderDto: CreateBidderDto) {
    const bidder = this.bidderRepository.create(createBidderDto);
    return this.bidderRepository.save(bidder);
  }

  findAll() {
    return this.bidderRepository.find();
  }

  findAllByBidder(bidderId: number) {
    return this.bidsRepository.find({ where: { bidderId } });
  }

  async findOne(id: number) {
    const bidder = await this.bidderRepository.findOne({ where: { id } });
    if (!bidder) {
      throw new NotFoundException(`Bidder with ID ${id} not found`);
    }
    return bidder;
  }

  async update(id: number, updateBidderDto: UpdateBidderDto) {
    const bidder = await this.findOne(id);
    Object.assign(bidder, updateBidderDto);
    await this.bidderRepository.save(bidder);
    return { ...bidder, message: `Bidder with ID ${id} updated successfully.` };
  }

  async remove(id: number) {
    const bidder = await this.findOne(id);
    await this.bidderRepository.remove(bidder);
    return { message: `Bidder with ID ${id} removed successfully.` };
  }
}
