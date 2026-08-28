export declare enum UserRole {
    ADMIN = "admin",
    RETAILER = "retailer",
    SUPPLIER = "supplier",
    CONSUMER = "consumer",
    BILLER = "biller"
}
export declare enum UserStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    PENDING = "Pending"
}
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    store?: string;
    retailerId?: string;
    storeId?: string;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
    store?: string;
    retailerId?: string;
    storeId?: string;
}
export declare class CreateRoleDto {
    name: string;
    description: string;
    permissions: Record<string, boolean>;
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: Record<string, boolean>;
}
export declare class CreateStoreDto {
    name: string;
    location: string;
    manager: string;
    retailerId?: string;
}
export declare class UpdateStoreDto {
    name?: string;
    location?: string;
    manager?: string;
    retailerId?: string;
}
export declare class SystemSettingsDto {
    reorderThreshold?: number;
    lowStockAlertEnabled?: boolean;
    autoReorderEnabled?: boolean;
    maxOrderQuantity?: number;
    currency?: string;
    timezone?: string;
}
