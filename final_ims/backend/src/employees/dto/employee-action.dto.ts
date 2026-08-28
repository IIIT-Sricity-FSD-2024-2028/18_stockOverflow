import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trimString } from '../../common/dto.transforms';

export class EmployeeActionDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  retailerId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  storeId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(600)
  reason?: string;
}
