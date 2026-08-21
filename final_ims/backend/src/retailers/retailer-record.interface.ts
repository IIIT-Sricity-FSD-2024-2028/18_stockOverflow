import { CreateRetailerSetupDto } from './dto/create-retailer-setup.dto';

export interface RetailerRecord extends CreateRetailerSetupDto {
  id: string;
  status: 'completed';
  profileStatus: 'active' | 'inactive';
  validationStatus?: 'pending' | 'approved' | 'rejected';
  assignedEmployeeId?: string;
  assignedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
