export interface SupplierDirectoryEntry {
  id: string;
  companyName: string;
  supplierCode?: string;
  businessType: string;
  businessEmail: string;
  phoneNumber?: string;
  state?: string;
  website?: string;
  primaryCategory?: string;
  paymentTerms?: string;
  profileStatus?: 'active' | 'inactive';
  productCount: number;
  createdAt: string;
  updatedAt: string;
}
