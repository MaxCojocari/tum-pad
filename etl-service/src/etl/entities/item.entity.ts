import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { Auction } from './auction.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Auction, (auction) => auction.item, { cascade: true })
  auction: Auction;

  @Column({ type: 'double precision' })
  reservePrice: number;

  @Column()
  currency: string;
}
