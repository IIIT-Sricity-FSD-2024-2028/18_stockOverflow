import { WarehouseZone, WarehouseInventoryItem } from '../../common/database.types';
declare class WarehouseInventoryItemDto implements WarehouseInventoryItem {
    sku: string;
    name: string;
    cat: string;
    qty: number;
    max: number;
    price: number;
    emoji: string;
}
declare class WarehouseZoneDto implements WarehouseZone {
    name: string;
    used: number;
    total: number;
    color: string;
}
export declare class CreateWarehouseDto {
    name: string;
    contact: string;
    phone: string;
    totalProducts?: number;
    totalStock?: number;
    createdOn?: string;
    createdTs?: number;
    status?: string;
    inventory?: WarehouseInventoryItemDto[];
    zones?: WarehouseZoneDto[];
}
export {};
