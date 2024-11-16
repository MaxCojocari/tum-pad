import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as dayjs from 'dayjs';

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

  @BeforeInsert()
  setLocalTimestamp() {
    this.timestamp = new Date(dayjs().toISOString());
  }
}
