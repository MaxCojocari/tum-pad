import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBidderDto } from './dto/create-bidder.dto';
import { UpdateBidderDto } from './dto/update-bidder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bidder } from './entities/bidder.entity';
import { Bid } from '../bids/entities/bid.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BiddersService {
  constructor(
    @InjectModel(Bidder.name) private readonly bidderModel: Model<Bidder>,
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
  ) {}

  create(createBidderDto: CreateBidderDto) {
    const bidder = new this.bidderModel(createBidderDto);
    return bidder.save();
  }

  findAll() {
    return this.bidderModel.find().exec();
  }

  findAllByBidder(bidderId: string) {
    return this.bidsRepository.find({ where: { bidderId } });
  }

  async findOne(id: string) {
    let bidder: any;
    try {
      bidder = await this.bidderModel.findOne({ _id: id }).exec();
    } catch (err) {
      console.log(err);
    }
    if (!bidder) {
      throw new NotFoundException(`Bidder with ID #${id} not found!`);
    }
    return bidder;
  }

  async update(id: string, updateBidderDto: UpdateBidderDto) {
    const bidder = await this.bidderModel
      .findOneAndUpdate({ _id: id }, { $set: updateBidderDto }, { new: true })
      .exec();
    if (!bidder) {
      throw new NotFoundException(`Bidder with ID #${id} not found`);
    }
    return {
      ...bidder['_doc'],
      message: `Bidder with ID ${id} updated successfully.`,
    };
  }

  async remove(id: string) {
    const bidder = await this.findOne(id);
    await bidder.deleteOne();
    return { message: `Bidder with ID ${id} removed successfully.` };
  }
}
