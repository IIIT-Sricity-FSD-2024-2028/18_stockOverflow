import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
export interface SupplierRecord extends CreateSupplierSetupDto {
    id: string;
    status: 'draft' | 'completed';
    profileStatus?: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}
