import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BusinessType,
  Currency,
  DeliveryRadius,
  PaymentTerms,
  ProductCategory,
  ProductUnit,
  RetailerCategory,
  ReturnPolicy,
  SellingType,
  ShippingMode,
  SupplierCategory,
} from './supplier.enums';

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const SUPPLIER_CODE_REGEX = /^[A-Z]{2,5}-[0-9]{3,6}$/;
const RETAILER_CODE_REGEX = /^RET-[0-9]{3,6}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

export class SupplierBusinessInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  companyName: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;

  @IsEmail()
  @MaxLength(160)
  businessEmail: string;

  @IsOptional()
  @Matches(PHONE_REGEX, {
    message: 'phoneNumber must be a valid phone number',
  })
  phoneNumber?: string;

  @IsOptional()
  @Matches(GST_REGEX, {
    message: 'gstNumber must be a valid Indian GST number',
  })
  gstNumber?: string;

  @IsOptional()
  @Matches(SUPPLIER_CODE_REGEX, {
    message: 'supplierCode must look like SUP-1234',
  })
  supplierCode?: string;

  @IsEnum(Currency)
  currency: Currency = Currency.INR;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  businessAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(180)
  website?: string;

  @IsOptional()
  @IsEnum(SupplierCategory)
  primaryCategory?: SupplierCategory;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms = PaymentTerms.Net30;

  @IsOptional()
  @IsEnum(SellingType)
  sellingType?: SellingType = SellingType.Wholesale;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class PrimaryContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  directEmail?: string;
}

export class RetailerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @Matches(RETAILER_CODE_REGEX, {
    message: 'code must look like RET-001',
  })
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  contactPerson: string;

  @IsOptional()
  @Matches(PHONE_REGEX, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsEnum(RetailerCategory)
  categorySupplied?: RetailerCategory;

  @IsOptional()
  @IsEnum(PaymentTerms)
  creditTerms?: PaymentTerms = PaymentTerms.Net30;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;
}

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  variant?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockAvailable: number;

  @IsEnum(ProductUnit)
  unit: ProductUnit = ProductUnit.Piece;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  reviewSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class PricingPoliciesDto {
  @IsOptional()
  @IsEnum(PaymentTerms)
  defaultPaymentTerms?: PaymentTerms = PaymentTerms.Net30;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumOrderValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  averageLeadTimeDays?: number;

  @IsOptional()
  @IsEnum(DeliveryRadius)
  deliveryRadius?: DeliveryRadius;

  @IsOptional()
  @IsEnum(ShippingMode)
  shippingMode?: ShippingMode;

  @IsOptional()
  @IsEnum(ReturnPolicy)
  returnPolicy?: ReturnPolicy;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialTermsNotes?: string;
}

export class BankDetailsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(34)
  accountNumber?: string;

  @IsOptional()
  @Matches(IFSC_REGEX, {
    message: 'ifscCode must be a valid IFSC code',
  })
  ifscCode?: string;

  @IsOptional()
  @Matches(UPI_REGEX, {
    message: 'upiId must be a valid UPI ID',
  })
  upiId?: string;
}

export class CreateSupplierSetupDto {
  @ValidateNested()
  @Type(() => SupplierBusinessInfoDto)
  business: SupplierBusinessInfoDto;

  @ValidateNested()
  @Type(() => PrimaryContactDto)
  primaryContact: PrimaryContactDto;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  profileStatus?: 'active' | 'inactive';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => RetailerDto)
  retailers?: RetailerDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products?: ProductDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PricingPoliciesDto)
  pricingPolicies?: PricingPoliciesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;
}
