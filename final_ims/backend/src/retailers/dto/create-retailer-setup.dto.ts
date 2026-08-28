import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/;
const RETAILER_CODE_REGEX = /^RET-[0-9]{3,6}$/i;
const SUPPLIER_CODE_REGEX = /^[A-Z]{2,5}-[0-9]{3,6}$/i;

export class RetailerBusinessInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  businessName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  businessType?: string;

  @IsEmail()
  @MaxLength(160)
  businessEmail!: string;

  @IsOptional()
  @Matches(PHONE_REGEX, {
    message: 'phoneNumber must be a valid phone number',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  taxId?: string;

  @IsOptional()
  @Matches(RETAILER_CODE_REGEX, {
    message: 'retailerCode must look like RET-001',
  })
  retailerCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  fiscalYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  businessAddress?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(180)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  primaryIndustry?: string;
}

export class RetailerPrimaryContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  directEmail?: string;
}

export class RetailerStoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactPerson?: string;

  @IsOptional()
  @Matches(PHONE_REGEX, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  notes?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class RetailerSupplierDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  supplierId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @Matches(SUPPLIER_CODE_REGEX, {
    message: 'code must look like SUP-001',
  })
  code?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @Matches(PHONE_REGEX, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  terms?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  lastRatedAt?: string;
}

export class RetailerProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minQuantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;
}

export class CreateRetailerSetupDto {
  @ValidateNested()
  @Type(() => RetailerBusinessInfoDto)
  business!: RetailerBusinessInfoDto;

  @ValidateNested()
  @Type(() => RetailerPrimaryContactDto)
  primaryContact!: RetailerPrimaryContactDto;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  profileStatus?: 'active' | 'inactive';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => RetailerStoreDto)
  stores?: RetailerStoreDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => RetailerSupplierDto)
  suppliers?: RetailerSupplierDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  products?: Record<string, unknown>[];
}
