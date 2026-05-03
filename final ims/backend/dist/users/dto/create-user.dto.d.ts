export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: string;
    store?: string;
    status?: string;
    storeId?: string;
    currentStoreId?: string;
    accessibleStoreIds?: string[];
    profileId?: string;
    profile?: Record<string, unknown>;
}
