import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonCollectionService } from '../common/collection.service';
import { Warehouse } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService extends JsonCollectionService<
  Warehouse,
  'warehouses'
> {
  protected readonly collectionKey = 'warehouses' as const;
  protected readonly entityName = 'Warehouse';

  constructor(db: JsonDbService) {
    super(db);
  }

  override findAll() {
    return this.findAllTyped();
  }

  create(createWarehouseDto: CreateWarehouseDto) {
    const warehouse: Warehouse = {
      id: this.nextNumericId(),
      name: createWarehouseDto.name,
      contact: createWarehouseDto.contact,
      phone: createWarehouseDto.phone,
      totalProducts: createWarehouseDto.totalProducts ?? 0,
      totalStock: createWarehouseDto.totalStock ?? 0,
      createdOn: createWarehouseDto.createdOn ?? this.formatDateLabel(),
      createdTs: createWarehouseDto.createdTs ?? this.dateNumber(new Date()),
      status: createWarehouseDto.status ?? 'active',
      inventory: createWarehouseDto.inventory ?? [],
      zones: createWarehouseDto.zones ?? [],
    };

    const warehouses = this.findAllTyped();
    warehouses.unshift(warehouse);
    this.write(warehouses);

    return warehouse;
  }

  update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouses = this.findAllTyped();
    const index = warehouses.findIndex((warehouse) => warehouse.id === id);

    if (index === -1) {
      throw new NotFoundException('Warehouse not found');
    }

    const updated: Warehouse = {
      ...warehouses[index],
      ...updateWarehouseDto,
    };

    warehouses[index] = updated;
    this.write(warehouses);

    return updated;
  }
}
