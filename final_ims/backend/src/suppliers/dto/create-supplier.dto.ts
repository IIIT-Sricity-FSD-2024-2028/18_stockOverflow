import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/dto.transforms';

const SUPPLIER_STATUSES = ['active', 'inactive'] as const;

export class CreateSupplierDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  company!: string;

  @Transform(trimString)
  @IsEmail()
  email!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  country?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  terms?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsIn(SUPPLIER_STATUSES)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalProducts?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalOrders?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(100)
  onTimeRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  qualityScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  averageLeadTimeDays?: number;
}
