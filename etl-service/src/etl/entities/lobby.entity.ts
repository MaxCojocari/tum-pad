import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  auctionId: number;

  @Column()
  lobbyWsUrl: string;
}
