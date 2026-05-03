import { StoresService } from './stores.service';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    findAll(): import("../common/database.types").StoreRecord[];
}
