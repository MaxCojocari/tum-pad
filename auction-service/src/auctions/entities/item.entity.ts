import { PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Auction } from './auction.entity';

export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => Auction, (auction) => auction.item)
  @JoinColumn()
  auction: Auction;

  @Column({ type: 'double' })
  reservePrice: number;

  @Column()
  currency: string;
}
