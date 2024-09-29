import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';

export enum AuctionStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  CLOSED = 'CLOSED',
}

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  seller: string;

  @OneToOne(() => Item, (item) => item.auction)
  item: Item;

  @Column()
  startTimestamp: string;

  @Column()
  endTimestamp: string;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.CREATED,
  })
  status: AuctionStatus;
}
