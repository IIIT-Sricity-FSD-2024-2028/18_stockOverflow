import { Injectable } from '@nestjs/common';
import { StoreRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { RetailersService } from '../retailers/retailers.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly db: JsonDbService,
    private readonly retailersService: RetailersService,
  ) {}

  findAll(retailerId?: string) {
    const directStores = this.db
      .getCollection('stores')
      .filter((store) => this.matchesRetailer(store.retailerId, retailerId));
    const retailerStores = this.retailersService.findAll().flatMap((retailer) => {
      if (!this.matchesRetailer(retailer.id, retailerId)) {
        return [];
      }

      return (retailer.stores || []).map<StoreRecord>((store, index) => ({
        id: store.code || `${retailer.id}-store-${index + 1}`,
        retailerId: retailer.id,
        name: store.name,
        location: store.address || '',
        manager: store.contactPerson || retailer.primaryContact.fullName,
        status: store.status || 'active',
      }));
    });

    const merged = [...directStores, ...retailerStores];
    const unique = new Map<string, StoreRecord>();
    merged.forEach((store) => {
      unique.set(String(store.id), store);
    });
    return Array.from(unique.values());
  }

  private matchesRetailer(candidateRetailerId?: string, retailerId?: string) {
    const normalizedCandidate =
      typeof candidateRetailerId === 'string' ? candidateRetailerId.trim() : '';
    const normalizedRetailerId =
      typeof retailerId === 'string' ? retailerId.trim() : '';

    if (!normalizedRetailerId) {
      return true;
    }

    return normalizedCandidate === normalizedRetailerId;
  }
}
