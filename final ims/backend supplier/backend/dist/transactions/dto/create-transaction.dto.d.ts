declare class CreateTransactionItemDto {
    sku: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    isReserved?: boolean;
    requestIds?: string[];
}
export declare class CreateTransactionDto {
    customer: string;
    store: string;
    storeId?: string;
    paymentMethod: string;
    items: CreateTransactionItemDto[];
    shipping?: number;
    tax?: number;
    coupon?: number;
    discount?: number;
    roundoff?: number;
    status?: string;
}
export {};
