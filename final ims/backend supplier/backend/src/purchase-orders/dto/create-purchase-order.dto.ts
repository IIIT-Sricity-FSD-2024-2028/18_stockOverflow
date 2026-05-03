import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PurchaseOrderItem } from '../../common/database.types';
import { trimString } from '../../common/dto.transforms';

const PURCHASE_ORDER_STATUSES = [
  'Draft',
  'Pending',
  'Pending Approval',
  'Confirmed',
  'In Delivery',
  'Delivered',
  'Cancelled',
  'Received',
] as const;

const STOCK_STATUSES = ['ok', 'low', 'out'] as const;

class PurchaseOrderItemDto implements PurchaseOrderItem {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  id!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  emoji!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  sku!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  cat!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsIn(STOCK_STATUSES)
  stockStatus!: string;
}

export class CreatePurchaseOrderDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  supplierId!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  supplierName?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  retailerId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  retailerName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  deliveryDate!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  notes?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsIn(PURCHASE_ORDER_STATUSES)
  status?: string;
}
