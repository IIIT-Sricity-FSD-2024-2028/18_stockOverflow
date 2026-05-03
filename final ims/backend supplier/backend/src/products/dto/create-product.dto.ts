import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class StoreInventoryDto {
  @IsString()
  storeId: string;

  @Type(() => Number)
  @IsNumber()
  qty: number;
}

export class CreateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsString()
  brand: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceUSD?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  finalPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsString()
  taxType?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  qty: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderPoint?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderQty?: number;

  @IsOptional()
  @IsString()
  creator?: string;

  @IsOptional()
  @IsString()
  creatorImg?: string;

  @IsOptional()
  @IsString()
  productImg?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  soldThisMonth?: number;

  @IsOptional()
  @IsString()
  trend?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreInventoryDto)
  storeInventory?: StoreInventoryDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionHtml?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  supplierSku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  warehouse?: string;

  @IsOptional()
  @IsString()
  bin?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  palette?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  customFields?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  variants?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @IsOptional()
  @IsBoolean()
  hasExpiry?: boolean;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lengthCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  widthCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsString()
  shippingClass?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  visibility?: string;
}
