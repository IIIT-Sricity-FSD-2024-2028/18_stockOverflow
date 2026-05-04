import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { UpdateSupplierSetupDto } from './dto/update-supplier-setup.dto';
import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord } from './supplier-record.interface';
import { SuppliersService } from './suppliers.service';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(createSupplierSetupDto: CreateSupplierSetupDto): SupplierRecord;
    findAll(): SupplierRecord[];
    getDirectory(): SupplierDirectoryEntry[];
    findLatest(): SupplierRecord | null;
    findByBusinessEmail(email: string): SupplierRecord | null;
    findOne(id: string): SupplierRecord;
    update(id: string, updateSupplierSetupDto: UpdateSupplierSetupDto): SupplierRecord;
    remove(id: string): void;
}
