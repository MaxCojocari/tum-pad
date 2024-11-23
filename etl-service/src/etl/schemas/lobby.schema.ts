import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Lobby {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  auctionId: number;

  @Prop({ required: true })
  lobbyWsUrl: string;
}

export const LobbySchema = SchemaFactory.createForClass(Lobby);
