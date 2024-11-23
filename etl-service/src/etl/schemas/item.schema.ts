import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Auction } from './auction.schema';

@Schema()
export class Item {
  @Prop({ required: true })
  id: number;
  
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Auction' }] })
  auction: Auction[];

  @Prop({ required: true, type: Number })
  reservePrice: number;

  @Prop({ required: true })
  currency: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
