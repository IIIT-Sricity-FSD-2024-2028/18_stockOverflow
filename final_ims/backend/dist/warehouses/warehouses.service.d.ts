import { JsonCollectionService } from '../common/collection.service';
import { Warehouse } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehousesService extends JsonCollectionService<Warehouse, 'warehouses'> {
    protected readonly collectionKey: "warehouses";
    protected readonly entityName = "Warehouse";
    constructor(db: JsonDbService);
    findAll(): Warehouse[];
    create(createWarehouseDto: CreateWarehouseDto): Warehouse;
    update(id: number, updateWarehouseDto: UpdateWarehouseDto): Warehouse;
}
