import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  userName: string;

  @IsEmail()
  userEmail: string;

  @IsOptional()
  @IsString()
  userRole?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}
