import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Item } from './item.schema';
import { AuctionStatus } from '../interfaces/auction-status.enum';

@Schema()
export class Auction {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sellerId: string;

  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  item: Item;

  @Prop({ required: true })
  startTimestamp: string;

  @Prop({ required: true })
  endTimestamp: string;

  @Prop({ type: String, enum: AuctionStatus, default: AuctionStatus.CREATED })
  status: AuctionStatus;

  @Prop()
  winnerId?: string;

  @Prop({ type: Number })
  winningFinalAmount?: number;
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);
