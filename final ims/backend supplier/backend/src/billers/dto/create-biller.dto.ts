import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { trimString } from '../../common/dto.transforms';

const BILLER_STATUSES = ['active', 'inactive'] as const;

export class CreateBillerDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  company!: string;

  @Transform(trimString)
  @IsEmail()
  email!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  phone!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  country!: string;

  @IsOptional()
  @IsIn(BILLER_STATUSES)
  status?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  avatar?: string;
}
