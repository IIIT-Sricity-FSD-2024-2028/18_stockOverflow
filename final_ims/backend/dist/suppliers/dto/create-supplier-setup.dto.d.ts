import { BusinessType, DeliveryRadius, PaymentTerms, ReturnPolicy, ShippingMode } from './supplier.enums';
export declare class SupplierBusinessInfoDto {
    companyName: string;
    businessType: BusinessType;
    businessEmail: string;
    phoneNumber?: string;
    gstNumber?: string;
    supplierCode?: string;
    currency?: string;
    businessAddress?: string;
    state?: string;
    website?: string;
    primaryCategory?: string;
    paymentTerms?: string;
    sellingType?: string;
    description?: string;
}
export declare class PrimaryContactDto {
    fullName: string;
    designation?: string;
    jobTitle?: string;
    directEmail?: string;
    directPhone?: string;
    mobileNumber?: string;
    phone?: string;
}
export declare class RetailerDto {
    id?: string;
    name: string;
    code?: string;
    contactPerson?: string;
    contact?: string;
    phone?: string;
    email?: string;
    state?: string;
    categorySupplied?: any;
    creditTerms?: any;
    terms?: string;
    creditLimit?: string | number;
    address?: string;
    addr?: string;
}
export declare class ProductDto {
    id?: string;
    sku: string;
    name: string;
    brand?: string;
    variant?: string;
    category?: string;
    cat?: string;
    unitPrice?: number;
    price?: number;
    minOrderQty?: number;
    moq?: number;
    stockAvailable?: number;
    stock?: number;
    unit?: string;
    status?: string;
    expiryDate?: string;
    reviewSummary?: string;
    description?: string;
    desc?: string;
}
export declare class PricingPoliciesDto {
    defaultPaymentTerms?: PaymentTerms;
    minimumOrderValue?: number;
    averageLeadTimeDays?: number;
    deliveryRadius?: DeliveryRadius;
    shippingMode?: ShippingMode;
    returnPolicy?: ReturnPolicy;
    specialTermsNotes?: string;
}
export declare class BankDetailsDto {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
}
export declare class CreateSupplierSetupDto {
    id?: string;
    business: SupplierBusinessInfoDto;
    primaryContact: PrimaryContactDto;
    profileStatus?: 'active' | 'inactive' | 'pending' | 'rejected';
    retailers?: RetailerDto[];
    products?: ProductDto[];
    pricingPolicies?: PricingPoliciesDto;
    bankDetails?: BankDetailsDto;
}
