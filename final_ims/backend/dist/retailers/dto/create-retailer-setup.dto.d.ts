export declare class RetailerBusinessInfoDto {
    businessName: string;
    businessType?: string;
    businessEmail: string;
    phoneNumber?: string;
    taxId?: string;
    retailerCode?: string;
    currency?: string;
    fiscalYear?: string;
    businessAddress?: string;
    website?: string;
    primaryIndustry?: string;
}
export declare class RetailerPrimaryContactDto {
    fullName: string;
    designation?: string;
    directEmail?: string;
}
export declare class RetailerStoreDto {
    name: string;
    code?: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    type?: string;
    notes?: string;
    status?: 'active' | 'inactive';
}
export declare class RetailerSupplierDto {
    supplierId?: string;
    name: string;
    code?: string;
    email?: string;
    phone?: string;
    company?: string;
    category?: string;
    terms?: string;
    status?: 'active' | 'inactive';
    rating?: number;
    comment?: string;
    lastRatedAt?: string;
}
export declare class RetailerProductDto {
    sku: string;
    name: string;
    category?: string;
    unitPrice: number;
    stockQuantity: number;
    minQuantity: number;
    unit?: string;
    emoji?: string;
}
export declare class CreateRetailerSetupDto {
    business: RetailerBusinessInfoDto;
    primaryContact: RetailerPrimaryContactDto;
    profileStatus?: 'active' | 'inactive';
    stores?: RetailerStoreDto[];
    suppliers?: RetailerSupplierDto[];
    products?: Record<string, unknown>[];
}
