import { IsOptional, IsString } from 'class-validator';

export class ResolveQueryDto {
  @IsString()
  response: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  status?: 'resolved' | 'in_progress';
}
