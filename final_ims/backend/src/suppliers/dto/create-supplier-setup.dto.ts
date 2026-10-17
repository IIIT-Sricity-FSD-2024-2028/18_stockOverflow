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
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  supplierCode?: string;

  @IsOptional()
  @IsString()
  currency?: string = Currency.INR;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  businessAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  website?: string;

  @IsOptional()
  @IsString()
  primaryCategory?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string = PaymentTerms.Net30;

  @IsOptional()
  @IsString()
  sellingType?: string = SellingType.Wholesale;

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
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  directEmail?: string;

  @IsOptional()
  @IsString()
  directPhone?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class RetailerDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  code?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  categorySupplied?: any;

  @IsOptional()
  creditTerms?: any;

  @IsOptional()
  terms?: string;

  @IsOptional()
  creditLimit?: string | number;

  @IsOptional()
  address?: string;

  @IsOptional()
  addr?: string;
}

export class ProductDto {
  @IsOptional()
  @IsString()
  id?: string;

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
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  cat?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  moq?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockAvailable?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  unit?: string = 'Piece';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  reviewSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  desc?: string;
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
  @IsOptional()
  @IsString()
  id?: string;

  @ValidateNested()
  @Type(() => SupplierBusinessInfoDto)
  business: SupplierBusinessInfoDto;

  @ValidateNested()
  @Type(() => PrimaryContactDto)
  primaryContact: PrimaryContactDto;

  @IsOptional()
  @IsIn(['active', 'inactive', 'pending', 'rejected'])
  profileStatus?: 'active' | 'inactive' | 'pending' | 'rejected';

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
