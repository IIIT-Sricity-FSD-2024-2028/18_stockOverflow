import { JsonDbService } from '../common/json-db.service';
export declare class StoresService {
    private readonly db;
    constructor(db: JsonDbService);
    findAll(): import("../common/database.types").StoreRecord[];
}
