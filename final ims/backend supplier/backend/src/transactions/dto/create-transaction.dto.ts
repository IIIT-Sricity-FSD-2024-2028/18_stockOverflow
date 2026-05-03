import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateTransactionItemDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isReserved?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requestIds?: string[];
}

export class CreateTransactionDto {
  @IsString()
  customer: string;

  @IsString()
  store: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsString()
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items: CreateTransactionItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shipping?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coupon?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roundoff?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
