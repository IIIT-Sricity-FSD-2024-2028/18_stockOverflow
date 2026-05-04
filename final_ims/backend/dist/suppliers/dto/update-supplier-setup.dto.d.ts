import { BankDetailsDto, PricingPoliciesDto, PrimaryContactDto, ProductDto, RetailerDto, SupplierBusinessInfoDto } from './create-supplier-setup.dto';
export declare class UpdateSupplierSetupDto {
    business?: SupplierBusinessInfoDto;
    primaryContact?: PrimaryContactDto;
    retailers?: RetailerDto[];
    products?: ProductDto[];
    pricingPolicies?: PricingPoliciesDto;
    bankDetails?: BankDetailsDto;
}
