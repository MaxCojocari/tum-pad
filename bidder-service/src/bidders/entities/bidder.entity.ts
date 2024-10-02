import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Bidder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
