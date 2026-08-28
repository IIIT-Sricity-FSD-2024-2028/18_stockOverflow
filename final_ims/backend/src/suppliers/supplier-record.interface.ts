import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';

export interface SupplierDocument {
  id: string;
  docType: string;
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface SupplierRecord extends CreateSupplierSetupDto {
  id: string;
  status: 'draft' | 'completed';
  profileStatus?: 'active' | 'inactive';
  documents?: SupplierDocument[];
  createdAt: string;
  updatedAt: string;
}

