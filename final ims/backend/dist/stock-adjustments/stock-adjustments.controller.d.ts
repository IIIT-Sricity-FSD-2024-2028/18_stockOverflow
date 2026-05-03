import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';
import { StockAdjustmentsService } from './stock-adjustments.service';
export declare class StockAdjustmentsController {
    private readonly stockAdjustmentsService;
    constructor(stockAdjustmentsService: StockAdjustmentsService);
    create(createStockAdjustmentDto: CreateStockAdjustmentDto): import("../common/database.types").StockAdjustment;
    findAll(retailerId?: string, storeId?: string): import("../common/database.types").StockAdjustment[];
    findOne(id: number): import("../common/database.types").StockAdjustment;
    update(id: number, updateStockAdjustmentDto: UpdateStockAdjustmentDto): import("../common/database.types").StockAdjustment;
    remove(id: number): {
        message: string;
        item: import("../common/database.types").StockAdjustment;
    };
}
