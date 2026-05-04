import { StoreRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { RetailersService } from '../retailers/retailers.service';
export declare class StoresService {
    private readonly db;
    private readonly retailersService;
    constructor(db: JsonDbService, retailersService: RetailersService);
    findAll(retailerId?: string): StoreRecord[];
    private matchesRetailer;
}
