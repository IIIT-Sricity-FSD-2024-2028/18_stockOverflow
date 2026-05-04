import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  RETAILER = 'retailer',
  SUPPLIER = 'supplier',
  CONSUMER = 'consumer',
  BILLER = 'biller',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  store?: string;

  @IsOptional()
  @IsString()
  retailerId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  store?: string;

  @IsOptional()
  @IsString()
  retailerId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsBoolean()
  permissions: Record<string, boolean>;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  permissions?: Record<string, boolean>;
}

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsString()
  manager: string;

  @IsOptional()
  @IsString()
  retailerId?: string;
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsString()
  retailerId?: string;
}

export class SystemSettingsDto {
  @IsOptional()
  reorderThreshold?: number;

  @IsOptional()
  lowStockAlertEnabled?: boolean;

  @IsOptional()
  autoReorderEnabled?: boolean;

  @IsOptional()
  maxOrderQuantity?: number;

  @IsOptional()
  currency?: string;

  @IsOptional()
  timezone?: string;
}