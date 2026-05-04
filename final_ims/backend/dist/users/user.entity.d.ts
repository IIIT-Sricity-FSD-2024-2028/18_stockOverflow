export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
    store?: string;
    storeId?: string;
    currentStoreId?: string;
    accessibleStoreIds?: string[];
    profileId?: string;
    profile?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}
