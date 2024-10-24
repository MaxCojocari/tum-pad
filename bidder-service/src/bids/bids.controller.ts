import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import {
  Ctx,
  GrpcMethod,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateLobbyDto } from '../bidders/dto/create-lobby.dto';
import { GetBidsByAuctionDto } from '../bidders/dto/get-bids-auction.dto';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(@Body() createBidDto: CreateBidDto) {
    return this.bidsService.create(createBidDto);
  }

  @Get()
  findAll() {
    return this.bidsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.bidsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateBidDto: UpdateBidDto) {
    return this.bidsService.update(id, updateBidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.bidsService.remove(id);
  }

  @MessagePattern({ cmd: 'get-bids-by-auction' })
  findBidsByAuction(@Payload() data: CreateLobbyDto) {
    return this.bidsService.findBidsByAuction(data.auctionId);
  }
}
