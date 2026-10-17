import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  BankDetailsDto,
  PricingPoliciesDto,
  PrimaryContactDto,
  ProductDto,
  RetailerDto,
  SupplierBusinessInfoDto,
} from './create-supplier-setup.dto';

export class UpdateSupplierSetupDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierBusinessInfoDto)
  business?: SupplierBusinessInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrimaryContactDto)
  primaryContact?: PrimaryContactDto;

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

  @IsOptional()
  companyName?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  supplierName?: string;

  @IsOptional()
  supplierCode?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  businessEmail?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  contactPerson?: string;

  @IsOptional()
  profileStatus?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  primaryCategory?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  paymentTerms?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  businessAddress?: string;

  @IsOptional()
  website?: string;

  @IsOptional()
  gstNumber?: string;

  @IsOptional()
  taxId?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  currency?: string;

  @IsOptional()
  businessType?: string;

  @IsOptional()
  sellingType?: string;
}
