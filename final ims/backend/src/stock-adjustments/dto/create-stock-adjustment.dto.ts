import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/dto.transforms';

const STOCK_ADJUSTMENT_TYPES = ['add', 'remove'] as const;
const STOCK_ADJUSTMENT_STATUSES = [
  'completed',
  'pending',
 ] as const;

export class CreateStockAdjustmentDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  retailerId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  storeId?: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  productSku!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  warehouse?: string;

  @IsIn(STOCK_ADJUSTMENT_TYPES)
  type!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reason!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  person?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  personImg?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  notes?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  date?: string;

  @IsOptional()
  @IsIn(STOCK_ADJUSTMENT_STATUSES)
  status?: string;
}
