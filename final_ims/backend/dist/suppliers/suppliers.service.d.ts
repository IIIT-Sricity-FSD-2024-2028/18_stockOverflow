import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord, SupplierDocument } from './supplier-record.interface';
import { ProductsService } from '../products/products.service';
export declare class SuppliersService {
    private readonly productsService;
    private readonly suppliers;
    private readonly dataDirectory;
    private readonly dataFile;
    constructor(productsService: ProductsService);
    create(createSupplierSetupDto: any): SupplierRecord;
    updateProfileStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'rejected', rejectionReason?: string): SupplierRecord;
    findAll(): SupplierRecord[];
    findOne(id: string): SupplierRecord;
    findLatest(): SupplierRecord | null;
    findByBusinessEmail(email: string): SupplierRecord | null;
    update(id: string, updateSupplierSetupDto: any): SupplierRecord;
    adjustProductStock(supplierId: string | number, sku: string, qtyDelta: number): SupplierRecord;
    getDirectory(): SupplierDirectoryEntry[];
    remove(id: string): void;
    addDocument(supplierId: string, file: any, docType?: string): SupplierDocument;
    getDocuments(supplierId: string): SupplierDocument[];
    removeDocument(supplierId: string, docId: string): void;
    private loadFromDisk;
    private persistToDisk;
    private syncProducts;
}
