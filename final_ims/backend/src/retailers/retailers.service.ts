import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { CreateRetailerSetupDto } from './dto/create-retailer-setup.dto';
import { UpdateRetailerSetupDto } from './dto/update-retailer-setup.dto';
import { RetailerDirectoryEntry } from './retailer-directory-entry.interface';
import { RetailerRecord } from './retailer-record.interface';

@Injectable()
export class RetailersService {
  private readonly retailers = new Map<string, RetailerRecord>();
  private readonly dataDirectory = join(__dirname, '..', '..', 'data');
  private readonly dataFile = join(this.dataDirectory, 'retailers.json');

  constructor() {
    this.loadFromDisk();
  }

  create(createRetailerSetupDto: CreateRetailerSetupDto): RetailerRecord {
    const now = new Date().toISOString();
    const retailer: RetailerRecord = {
      ...createRetailerSetupDto,
      stores: createRetailerSetupDto.stores ?? [],
      suppliers: createRetailerSetupDto.suppliers ?? [],
      products: createRetailerSetupDto.products ?? [],
      id: randomUUID(),
      status: 'completed',
      profileStatus: createRetailerSetupDto.profileStatus ?? 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.retailers.set(retailer.id, retailer);
    this.persistToDisk();
    return retailer;
  }

  findAll(): RetailerRecord[] {
    return Array.from(this.retailers.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  findOne(id: string): RetailerRecord {
    const retailer = this.retailers.get(id);

    if (!retailer) {
      throw new NotFoundException(`Retailer setup "${id}" was not found`);
    }

    return retailer;
  }

  findLatest(): RetailerRecord | null {
    return this.findAll()[0] ?? null;
  }

  getDirectory(): RetailerDirectoryEntry[] {
    return this.findAll().map((retailer) => ({
      id: retailer.id,
      businessName: retailer.business.businessName,
      retailerCode: retailer.business.retailerCode || '',
      businessType: retailer.business.businessType || '',
      businessEmail: retailer.business.businessEmail,
      phoneNumber: retailer.business.phoneNumber || '',
      address: retailer.business.businessAddress || '',
      website: retailer.business.website || '',
      primaryIndustry: retailer.business.primaryIndustry || '',
      primaryContactName: retailer.primaryContact.fullName,
      primaryContactEmail: retailer.primaryContact.directEmail || '',
      storeCount: (retailer.stores || []).length,
      stores: (retailer.stores || []).map((store, index) => ({
        name: store.name,
        code: store.code || `STORE-${index + 1}`,
        contactPerson: store.contactPerson || '',
        phone: store.phone || '',
        address: store.address || '',
        type: store.type || '',
        status: store.status || 'active',
      })),
      profileStatus: retailer.profileStatus || 'active',
      createdAt: retailer.createdAt,
      updatedAt: retailer.updatedAt,
    }));
  }

  findByBusinessEmail(email: string): RetailerRecord | null {
    const lookup = String(email || '').trim().toLowerCase();
    if (!lookup) {
      return null;
    }

    return (
      this.findAll().find(
        (retailer) =>
          retailer.business.businessEmail.toLowerCase() === lookup ||
          retailer.primaryContact.directEmail?.toLowerCase() === lookup,
      ) ?? null
    );
  }

  update(id: string, updateRetailerSetupDto: UpdateRetailerSetupDto): RetailerRecord {
    const retailer = this.findOne(id);
    const updatedRetailer: RetailerRecord = {
      ...retailer,
      ...updateRetailerSetupDto,
      business: updateRetailerSetupDto.business ?? retailer.business,
      primaryContact:
        updateRetailerSetupDto.primaryContact ?? retailer.primaryContact,
      stores: updateRetailerSetupDto.stores ?? retailer.stores,
      suppliers: updateRetailerSetupDto.suppliers ?? retailer.suppliers,
      products: updateRetailerSetupDto.products ?? retailer.products,
      profileStatus:
        updateRetailerSetupDto.profileStatus ?? retailer.profileStatus ?? 'active',
      updatedAt: new Date().toISOString(),
    };

    this.retailers.set(id, updatedRetailer);
    this.persistToDisk();
    return updatedRetailer;
  }

  remove(id: string): void {
    const deleted = this.retailers.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Retailer setup "${id}" was not found`);
    }

    this.persistToDisk();
  }

  private loadFromDisk(): void {
    mkdirSync(this.dataDirectory, { recursive: true });

    if (!existsSync(this.dataFile)) {
      writeFileSync(this.dataFile, '[]', 'utf-8');
      return;
    }

    const raw = readFileSync(this.dataFile, 'utf-8').trim();

    if (!raw) {
      return;
    }

    try {
      const retailers = JSON.parse(raw) as RetailerRecord[];

      retailers.forEach((retailer) => {
        this.retailers.set(retailer.id, {
          ...retailer,
          stores: retailer.stores ?? [],
          suppliers: retailer.suppliers ?? [],
          products: retailer.products ?? [],
          profileStatus: retailer.profileStatus ?? 'active',
        });
      });
    } catch {
      writeFileSync(this.dataFile, '[]', 'utf-8');
    }
  }

  private persistToDisk(): void {
    const retailers = this.findAll();
    writeFileSync(this.dataFile, JSON.stringify(retailers, null, 2), 'utf-8');
  }
}
