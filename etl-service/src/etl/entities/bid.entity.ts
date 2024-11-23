import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  auctionId: number;

  @Column()
  bidderId: string;

  @Column({ type: 'double precision' })
  amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
