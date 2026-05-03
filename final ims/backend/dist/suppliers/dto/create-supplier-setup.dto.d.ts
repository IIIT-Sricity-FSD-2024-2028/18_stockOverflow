import { BusinessType, Currency, DeliveryRadius, PaymentTerms, ProductCategory, ProductUnit, RetailerCategory, ReturnPolicy, SellingType, ShippingMode, SupplierCategory } from './supplier.enums';
export declare class SupplierBusinessInfoDto {
    companyName: string;
    businessType: BusinessType;
    businessEmail: string;
    phoneNumber?: string;
    gstNumber?: string;
    supplierCode?: string;
    currency: Currency;
    businessAddress?: string;
    state?: string;
    website?: string;
    primaryCategory?: SupplierCategory;
    paymentTerms?: PaymentTerms;
    sellingType?: SellingType;
    description?: string;
}
export declare class PrimaryContactDto {
    fullName: string;
    designation?: string;
    directEmail?: string;
}
export declare class RetailerDto {
    name: string;
    code?: string;
    contactPerson: string;
    phone?: string;
    email?: string;
    state?: string;
    categorySupplied?: RetailerCategory;
    creditTerms?: PaymentTerms;
    address?: string;
}
export declare class ProductDto {
    sku: string;
    name: string;
    brand?: string;
    variant?: string;
    category?: ProductCategory;
    unitPrice: number;
    minOrderQty: number;
    stockAvailable: number;
    unit: ProductUnit;
    expiryDate?: string;
    reviewSummary?: string;
    description?: string;
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
    business: SupplierBusinessInfoDto;
    primaryContact: PrimaryContactDto;
    profileStatus?: 'active' | 'inactive';
    retailers?: RetailerDto[];
    products?: ProductDto[];
    pricingPolicies?: PricingPoliciesDto;
    bankDetails?: BankDetailsDto;
}
