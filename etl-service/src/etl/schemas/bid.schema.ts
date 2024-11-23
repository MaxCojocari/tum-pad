import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';

@Schema()
export class Bid {
  @Prop({ required: true })
  auctionId: number;

  @Prop({ required: true })
  bidderId: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  timestamp: Date;
}

export const BidSchema = SchemaFactory.createForClass(Bid);
