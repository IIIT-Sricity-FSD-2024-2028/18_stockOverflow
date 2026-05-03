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
    retailerId?: string;
    customer: string;
    customerEmail?: string;
    customerId?: string;
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
