import { IsIn, IsOptional, IsString } from 'class-validator';

export class ResolveAssignmentDto {
  @IsString()
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}
