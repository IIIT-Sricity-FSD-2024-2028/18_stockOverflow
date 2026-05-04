import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { trimString } from '../../common/dto.transforms';

export class CreateBillerRequestDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  retailerId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  storeId?: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  name!: string;

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
  company!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  country!: string;
}
