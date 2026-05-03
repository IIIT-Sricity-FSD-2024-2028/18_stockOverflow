import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { UpdateSupplierSetupDto } from './dto/update-supplier-setup.dto';
import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord } from './supplier-record.interface';
export declare class SuppliersService {
    private readonly suppliers;
    private readonly dataDirectory;
    private readonly dataFile;
    constructor();
    create(createSupplierSetupDto: CreateSupplierSetupDto): SupplierRecord;
    findAll(): SupplierRecord[];
    findOne(id: string): SupplierRecord;
    findLatest(): SupplierRecord | null;
    findByBusinessEmail(email: string): SupplierRecord | null;
    update(id: string, updateSupplierSetupDto: UpdateSupplierSetupDto): SupplierRecord;
    getDirectory(): SupplierDirectoryEntry[];
    remove(id: string): void;
    private loadFromDisk;
    private persistToDisk;
}
