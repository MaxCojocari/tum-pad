import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BiddersService } from './bidders.service';
import { CreateBidderDto } from './dto/create-bidder.dto';
import { UpdateBidderDto } from './dto/update-bidder.dto';

@Controller('bidders')
export class BiddersController {
  constructor(private readonly biddersService: BiddersService) {}

  @Post()
  create(@Body() createBidderDto: CreateBidderDto) {
    return this.biddersService.create(createBidderDto);
  }

  @Get()
  findAll() {
    return this.biddersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.biddersService.findOne(id);
  }

  @Get(':id/bids')
  findBidsByBidder(@Param('id') id: string) {
    return this.biddersService.findAllByBidder(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBidderDto: UpdateBidderDto) {
    return this.biddersService.update(id, updateBidderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.biddersService.remove(id);
  }
}
