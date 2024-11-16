import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Bidder {
  @Prop()
  name: string;

  @Prop()
  email: string;
}

export const BidderSchema = SchemaFactory.createForClass(Bidder);
