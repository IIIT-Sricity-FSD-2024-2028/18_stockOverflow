import { CreateRetailerSetupDto } from './dto/create-retailer-setup.dto';
import { RetailerDirectoryEntry } from './retailer-directory-entry.interface';
import { UpdateRetailerSetupDto } from './dto/update-retailer-setup.dto';
import { RetailerRecord } from './retailer-record.interface';
import { RetailersService } from './retailers.service';
export declare class RetailersController {
    private readonly retailersService;
    constructor(retailersService: RetailersService);
    create(createRetailerSetupDto: CreateRetailerSetupDto): RetailerRecord;
    findAll(): RetailerRecord[];
    getDirectory(): RetailerDirectoryEntry[];
    findLatest(): RetailerRecord | null;
    findByBusinessEmail(email: string): RetailerRecord | null;
    findOne(id: string): RetailerRecord;
    update(id: string, updateRetailerSetupDto: UpdateRetailerSetupDto): RetailerRecord;
    remove(id: string): void;
}
