import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductFeedbackDto } from './dto/create-product-feedback.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): import("../common/database.types").ProductRecord;
    findAll(retailerId?: string, storeId?: string): import("../common/database.types").ProductRecord[];
    findBySku(sku: string, retailerId?: string, storeId?: string): import("../common/database.types").ProductRecord;
    getFeedback(sku: string, retailerId?: string): import("../common/database.types").ProductFeedback[];
    getRatingSummary(sku: string, retailerId?: string): {
        avg: number;
        total: number;
        breakdown: import("../common/database.types").RatingBreakdown;
    };
    addFeedback(sku: string, createProductFeedbackDto: CreateProductFeedbackDto, retailerId?: string): import("../common/database.types").ProductFeedback;
    findOne(id: string, retailerId?: string, storeId?: string): import("../common/database.types").ProductRecord;
    update(id: string, updateProductDto: UpdateProductDto): import("../common/database.types").ProductRecord;
    remove(id: string): {
        message: string;
        item: import("../common/database.types").ProductRecord;
    };
}
