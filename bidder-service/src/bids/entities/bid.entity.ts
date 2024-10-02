import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  bidId: string;

  @Column()
  auctionId: number;

  @Column()
  bidderId: number;

  @Column({ type: 'double precision' })
  amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
