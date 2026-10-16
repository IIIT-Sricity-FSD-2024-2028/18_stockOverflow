import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PurchaseOrderItem } from '../../common/database.types';
import { trimString } from '../../common/dto.transforms';

export const PURCHASE_ORDER_STATUSES = [
  'Draft',
  'Pending',
  'Pending Approval',
  'Confirmed',
  'In Delivery',
  'Delivered',
  'Cancelled',
  'Received',
  'Approved',
  'draft',
  'pending',
  'pending approval',
  'confirmed',
  'in delivery',
  'indelivery',
  'delivered',
  'cancelled',
  'received',
  'approved',
] as const;

export class PurchaseOrderItemDto implements PurchaseOrderItem {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  id!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  emoji!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  sku!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  cat!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsString()
  stockStatus!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  profitMargin?: number;
}

export class CreatePurchaseOrderDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  id?: string;

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

  @IsOptional()
  @Transform(trimString)
  @IsString()
  storeId?: string;

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
  @Type(() => Number)
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  units?: number;

  @IsOptional()
  @IsIn(PURCHASE_ORDER_STATUSES)
  status?: string;
}
