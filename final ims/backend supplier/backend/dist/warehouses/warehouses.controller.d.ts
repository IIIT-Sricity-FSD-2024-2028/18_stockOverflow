import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    create(createWarehouseDto: CreateWarehouseDto): import("../common/database.types").Warehouse;
    findAll(): import("../common/database.types").Warehouse[];
    findOne(id: number): import("../common/database.types").Warehouse;
    update(id: number, updateWarehouseDto: UpdateWarehouseDto): import("../common/database.types").Warehouse;
    remove(id: number): {
        message: string;
        item: import("../common/database.types").Warehouse;
    };
}
