import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class ItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  reservePrice: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
