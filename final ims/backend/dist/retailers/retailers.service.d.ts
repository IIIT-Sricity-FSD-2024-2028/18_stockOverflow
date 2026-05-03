import { CreateRetailerSetupDto } from './dto/create-retailer-setup.dto';
import { UpdateRetailerSetupDto } from './dto/update-retailer-setup.dto';
import { RetailerDirectoryEntry } from './retailer-directory-entry.interface';
import { RetailerRecord } from './retailer-record.interface';
export declare class RetailersService {
    private readonly retailers;
    private readonly dataDirectory;
    private readonly dataFile;
    constructor();
    create(createRetailerSetupDto: CreateRetailerSetupDto): RetailerRecord;
    findAll(): RetailerRecord[];
    findOne(id: string): RetailerRecord;
    findLatest(): RetailerRecord | null;
    getDirectory(): RetailerDirectoryEntry[];
    findByBusinessEmail(email: string): RetailerRecord | null;
    update(id: string, updateRetailerSetupDto: UpdateRetailerSetupDto): RetailerRecord;
    remove(id: string): void;
    private loadFromDisk;
    private persistToDisk;
}
