import { PartialType } from '@nestjs/mapped-types';
import { CreateBidderDto } from './create-bidder.dto';

export class UpdateBidderDto extends PartialType(CreateBidderDto) {}
