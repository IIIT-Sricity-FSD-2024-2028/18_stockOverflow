import { PurchaseOrderItem } from '../../common/database.types';
declare class PurchaseOrderItemDto implements PurchaseOrderItem {
    id: string;
    name: string;
    emoji: string;
    sku: string;
    cat: string;
    price: number;
    qty: number;
    stock: number;
    stockStatus: string;
}
export declare class CreatePurchaseOrderDto {
    supplierId: string;
    supplierName?: string;
    retailerId?: string;
    retailerName?: string;
    storeId?: string;
    items: PurchaseOrderItemDto[];
    deliveryDate: string;
    paymentTerms?: string;
    notes?: string;
    shippingAddress?: string;
    status?: string;
}
export {};
