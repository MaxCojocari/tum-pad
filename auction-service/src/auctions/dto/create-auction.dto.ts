import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { AuctionStatus } from '../interfaces/auction-status.enum';
import { ItemDto } from './create-item.dto';

export class CreateAuctionDto {
  @IsString()
  name: string;

  @IsNumber()
  sellerId: number;

  @IsEnum(AuctionStatus)
  @IsOptional()
  status: AuctionStatus;

  @IsDateString()
  startTimestamp: string;

  @IsNumber()
  duration: number;

  @ValidateNested()
  @Type(() => ItemDto)
  item: ItemDto;
}
