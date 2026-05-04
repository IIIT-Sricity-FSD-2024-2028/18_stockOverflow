import { PartialType } from '@nestjs/mapped-types';
import { CreateBillerDto } from './create-biller.dto';

export class UpdateBillerDto extends PartialType(CreateBillerDto) {}
