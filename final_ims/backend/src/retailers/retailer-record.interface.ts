import { CreateRetailerSetupDto } from './dto/create-retailer-setup.dto';

export interface RetailerRecord extends CreateRetailerSetupDto {
  id: string;
  status: 'completed';
  profileStatus: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
