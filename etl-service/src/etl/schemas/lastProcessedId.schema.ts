import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class LastProcessedId {
  @Prop({ required: true, unique: true })
  entityName: string;

  @Prop({ required: true })
  lastProcessedId: string;
}

export const LastProcessedIdSchema =
  SchemaFactory.createForClass(LastProcessedId);
