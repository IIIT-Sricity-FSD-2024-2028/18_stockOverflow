import { JsonCollectionService } from '../common/collection.service';
import { StockAdjustment } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';
export declare class StockAdjustmentsService extends JsonCollectionService<StockAdjustment, 'stockAdjustments'> {
    private readonly productsService;
    protected readonly collectionKey: "stockAdjustments";
    protected readonly entityName = "Stock adjustment";
    private readonly fallbackPersonImg;
    constructor(db: JsonDbService, productsService: ProductsService);
    findAll(retailerId?: string, storeId?: string): StockAdjustment[];
    create(createStockAdjustmentDto: CreateStockAdjustmentDto): StockAdjustment;
    update(id: number, updateStockAdjustmentDto: UpdateStockAdjustmentDto): StockAdjustment;
    private matchesScope;
    private normalizeText;
    private resolvePreferredStoreId;
    private resolveQuantity;
}
