import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): import("../common/database.types").PurchaseOrder;
    findAll(): import("../common/database.types").PurchaseOrder[];
    findOne(id: string): import("../common/database.types").PurchaseOrder;
    update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): import("../common/database.types").PurchaseOrder;
    remove(id: string): {
        message: string;
        item: import("../common/database.types").PurchaseOrder;
    };
}
