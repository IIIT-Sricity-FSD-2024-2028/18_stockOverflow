import { PartialType } from '@nestjs/mapped-types';
import { CreateRetailerSetupDto } from './create-retailer-setup.dto';

export class UpdateRetailerSetupDto extends PartialType(CreateRetailerSetupDto) {}
