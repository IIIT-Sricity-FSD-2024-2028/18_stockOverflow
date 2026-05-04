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
import { WarehouseZone, WarehouseInventoryItem } from '../../common/database.types';
import { trimString } from '../../common/dto.transforms';

const WAREHOUSE_STATUSES = ['active', 'inactive'] as const;

class WarehouseInventoryItemDto implements WarehouseInventoryItem {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  sku!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  cat!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  max!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price!: number;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  emoji!: string;
}

class WarehouseZoneDto implements WarehouseZone {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  used!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  total!: number;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  color!: string;
}

export class CreateWarehouseDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  contact!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  phone!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalProducts?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalStock?: number;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  createdOn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  createdTs?: number;

  @IsOptional()
  @IsIn(WAREHOUSE_STATUSES)
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseInventoryItemDto)
  inventory?: WarehouseInventoryItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseZoneDto)
  zones?: WarehouseZoneDto[];
}
