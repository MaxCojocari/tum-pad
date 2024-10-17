import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';
import { AuctionStatus } from '../interfaces/auction-status.enum';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sellerId: number;

  @ManyToOne(() => Item, (item) => item.auction)
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

  @Column({ nullable: true })
  winnerId?: number;

  @Column({ type: 'double precision', nullable: true })
  winningFinalAmount?: number;
}
