import { IsIn, IsOptional, IsString } from 'class-validator';

export class ResolveAssignmentDto {
  @IsOptional()
  @IsString()
  @IsIn(['approve', 'reject', 'approved', 'rejected'])
  action?: 'approve' | 'reject' | 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}
