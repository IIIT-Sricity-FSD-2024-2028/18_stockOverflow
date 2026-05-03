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
}
