import { BankDetailsDto, PricingPoliciesDto, PrimaryContactDto, ProductDto, RetailerDto, SupplierBusinessInfoDto } from './create-supplier-setup.dto';
export declare class UpdateSupplierSetupDto {
    business?: SupplierBusinessInfoDto;
    primaryContact?: PrimaryContactDto;
    profileStatus?: 'active' | 'inactive';
    validationStatus?: 'pending' | 'approved' | 'rejected';
    assignedEmployeeId?: string;
    assignedAt?: string;
    validatedBy?: string;
    validatedAt?: string;
    rejectionReason?: string;
    retailers?: RetailerDto[];
    products?: ProductDto[];
    pricingPolicies?: PricingPoliciesDto;
    bankDetails?: BankDetailsDto;
}
