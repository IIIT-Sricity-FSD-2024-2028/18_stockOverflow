import { JsonCollectionService } from '../common/collection.service';
import { PurchaseOrder } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductsService } from '../products/products.service';
export declare class PurchaseOrdersService extends JsonCollectionService<PurchaseOrder, 'purchaseOrders'> {
    private readonly suppliersService;
    private readonly retailersService;
    private readonly productsService;
    protected readonly collectionKey: "purchaseOrders";
    protected readonly entityName = "Purchase order";
    constructor(db: JsonDbService, suppliersService: SuppliersService, retailersService: RetailersService, productsService: ProductsService);
    findAll(retailerId?: string, storeId?: string, supplierId?: string): PurchaseOrder[];
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): PurchaseOrder;
    update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): PurchaseOrder;
    private syncInventoryOnDelivery;
    private matchesScope;
    private normalizeText;
}
