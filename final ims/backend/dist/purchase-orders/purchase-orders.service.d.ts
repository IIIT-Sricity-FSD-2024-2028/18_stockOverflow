import { JsonCollectionService } from '../common/collection.service';
import { PurchaseOrder } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
export declare class PurchaseOrdersService extends JsonCollectionService<PurchaseOrder, 'purchaseOrders'> {
    private readonly suppliersService;
    private readonly retailersService;
    protected readonly collectionKey: "purchaseOrders";
    protected readonly entityName = "Purchase order";
    constructor(db: JsonDbService, suppliersService: SuppliersService, retailersService: RetailersService);
    findAll(retailerId?: string, storeId?: string, supplierId?: string): PurchaseOrder[];
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): PurchaseOrder;
    update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): PurchaseOrder;
    private matchesScope;
    private normalizeText;
}
