import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  store?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  currentStoreId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibleStoreIds?: string[];

  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsObject()
  profile?: Record<string, unknown>;
}
