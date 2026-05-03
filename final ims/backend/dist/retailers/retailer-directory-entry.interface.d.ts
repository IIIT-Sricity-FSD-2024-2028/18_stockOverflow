export interface RetailerDirectoryEntry {
    id: string;
    businessName: string;
    retailerCode: string;
    businessType: string;
    businessEmail: string;
    phoneNumber: string;
    address: string;
    website: string;
    primaryIndustry: string;
    primaryContactName: string;
    primaryContactEmail: string;
    storeCount: number;
    stores: Array<{
        name: string;
        code: string;
        contactPerson: string;
        phone: string;
        address: string;
        type: string;
        status: string;
    }>;
    profileStatus: string;
    createdAt: string;
    updatedAt: string;
}
