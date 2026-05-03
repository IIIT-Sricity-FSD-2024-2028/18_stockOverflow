import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReservationRequestDto {
  @IsString()
  sku: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty: number;

  @IsString()
  storeId: string;

  @IsOptional()
  @IsString()
  store?: string;

  @IsString()
  paymentMethod: string;
}
