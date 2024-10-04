import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { GrpcMethod } from '@nestjs/microservices';
import { VerifyAuctionRunningDto } from './dto/verify-auction-running.dto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  create(@Body() createAuctionDto: CreateAuctionDto) {
    return this.auctionsService.create(createAuctionDto);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheKey('auctions')
  @CacheTTL(100)
  @Get()
  async findAll() {
    return await this.auctionsService.findAll();
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.auctionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateAuctionDto: UpdateAuctionDto) {
    return this.auctionsService.update(id, updateAuctionDto);
  }

  @Post(':id/close')
  close(@Param('id') id: number) {
    return this.auctionsService.close(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.auctionsService.remove(id);
  }

  @GrpcMethod('AuctionsService')
  isAuctionRunning(data: VerifyAuctionRunningDto) {
    return this.auctionsService.isAuctionRunning(data.auctionId);
  }
}
