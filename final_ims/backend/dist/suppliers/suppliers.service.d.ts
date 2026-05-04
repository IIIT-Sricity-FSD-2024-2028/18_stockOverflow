import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { UpdateSupplierSetupDto } from './dto/update-supplier-setup.dto';
import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord } from './supplier-record.interface';
import { ProductsService } from '../products/products.service';
export declare class SuppliersService {
    private readonly productsService;
    private readonly suppliers;
    private readonly dataDirectory;
    private readonly dataFile;
    constructor(productsService: ProductsService);
    create(createSupplierSetupDto: CreateSupplierSetupDto): SupplierRecord;
    findAll(): SupplierRecord[];
    findOne(id: string): SupplierRecord;
    findLatest(): SupplierRecord | null;
    findByBusinessEmail(email: string): SupplierRecord | null;
    update(id: string, updateSupplierSetupDto: UpdateSupplierSetupDto): SupplierRecord;
    adjustProductStock(supplierId: string | number, sku: string, qtyDelta: number): SupplierRecord;
    getDirectory(): SupplierDirectoryEntry[];
    remove(id: string): void;
    private loadFromDisk;
    private persistToDisk;
    private syncProducts;
}
