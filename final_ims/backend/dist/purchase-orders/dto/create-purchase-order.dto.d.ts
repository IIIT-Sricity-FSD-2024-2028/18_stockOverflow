import { PurchaseOrderItem } from '../../common/database.types';
export declare const PURCHASE_ORDER_STATUSES: readonly ["Draft", "Pending", "Pending Approval", "Confirmed", "In Delivery", "Delivered", "Cancelled", "Received", "Approved", "draft", "pending", "pending approval", "confirmed", "in delivery", "indelivery", "delivered", "cancelled", "received", "approved"];
export declare class PurchaseOrderItemDto implements PurchaseOrderItem {
    id: string;
    name: string;
    emoji: string;
    sku: string;
    cat: string;
    price: number;
    qty: number;
    stock: number;
    stockStatus: string;
    profitMargin?: number;
}
export declare class CreatePurchaseOrderDto {
    id?: string;
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
    subtotal?: number;
    tax?: number;
    total?: number;
    units?: number;
    status?: string;
}
