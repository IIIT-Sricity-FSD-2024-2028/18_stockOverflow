import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
export interface SupplierRecord extends CreateSupplierSetupDto {
    id: string;
    status: 'draft' | 'completed';
    profileStatus?: 'active' | 'inactive';
    validationStatus?: 'pending' | 'approved' | 'rejected';
    assignedEmployeeId?: string;
    assignedAt?: string;
    validatedBy?: string;
    validatedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}
