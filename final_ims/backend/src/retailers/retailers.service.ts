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
      profileStatus: createRetailerSetupDto.profileStatus ?? 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.retailers.set(retailer.id, retailer);
    this.persistToDisk();
    return retailer;
  }

  updateProfileStatus(
    id: string,
    status: 'active' | 'inactive' | 'pending' | 'rejected',
    rejectionReason?: string,
  ): RetailerRecord {
    const retailer = this.findOne(id);
    retailer.profileStatus = status;
    if (status === 'rejected' && rejectionReason) {
      (retailer as any).rejectionReason = rejectionReason;
    } else if (status !== 'rejected') {
      delete (retailer as any).rejectionReason;
    }
    retailer.updatedAt = new Date().toISOString();
    this.retailers.set(id, retailer);
    this.persistToDisk();
    return retailer;
  }

  findAll(): RetailerRecord[] {
    return Array.from(this.retailers.values()).sort((a, b) =>
      String(b.updatedAt || b.createdAt || '').localeCompare(
        String(a.updatedAt || a.createdAt || ''),
      ),
    );
  }

  findOne(id: string): RetailerRecord {
    if (!id) {
      throw new NotFoundException(`Retailer setup "${id}" was not found`);
    }
    const target = String(id).trim().toLowerCase();

    // 1. Direct Map lookup
    let retailer = this.retailers.get(id);
    if (retailer) return retailer;

    // 2. Lookup by case-insensitive ID, email, or retailer code
    const all = Array.from(this.retailers.values());
    retailer = all.find((r) => {
      if (String(r.id || '').trim().toLowerCase() === target) return true;
      if (r.business?.businessEmail && String(r.business.businessEmail).trim().toLowerCase() === target) return true;
      if (r.business?.retailerCode && String(r.business.retailerCode).trim().toLowerCase() === target) return true;
      if (r.primaryContact?.directEmail && String(r.primaryContact.directEmail).trim().toLowerCase() === target) return true;
      return false;
    });
    if (retailer) return retailer;

    // 3. Lookup user from users.json on disk if needed
    try {
      const usersFile = join(this.dataDirectory, 'users.json');
      if (existsSync(usersFile)) {
        const users = JSON.parse(readFileSync(usersFile, 'utf-8'));
        if (Array.isArray(users)) {
          const matchedUser = users.find((u) => {
            return (
              String(u.id || '').trim().toLowerCase() === target ||
              String(u.profileId || '').trim().toLowerCase() === target ||
              String(u.email || '').trim().toLowerCase() === target
            );
          });
          if (matchedUser) {
            if (matchedUser.profileId && this.retailers.has(matchedUser.profileId)) {
              return this.retailers.get(matchedUser.profileId)!;
            }
            if (matchedUser.email) {
              const found = this.findByBusinessEmail(matchedUser.email);
              if (found) return found;
            }
          }
        }
      }
    } catch {}

    throw new NotFoundException(`Retailer setup "${id}" was not found`);
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
    let retailer: RetailerRecord;
    try {
      retailer = this.findOne(id);
    } catch {
      const now = new Date().toISOString();
      const newRetailer: RetailerRecord = {
        id: id || randomUUID(),
        business: updateRetailerSetupDto.business || {
          businessName: 'Retailer Store',
          businessType: 'Retail',
          businessEmail: '',
          retailerCode: `RET-${Math.floor(100 + Math.random() * 900)}`,
          currency: 'INR',
          fiscalYear: 'April',
        },
        primaryContact: updateRetailerSetupDto.primaryContact || {
          fullName: 'Retailer User',
        },
        stores: updateRetailerSetupDto.stores ?? [],
        suppliers: updateRetailerSetupDto.suppliers ?? [],
        products: updateRetailerSetupDto.products ?? [],
        status: 'completed',
        profileStatus: updateRetailerSetupDto.profileStatus ?? 'pending',
        createdAt: now,
        updatedAt: now,
      };
      this.retailers.set(newRetailer.id, newRetailer);
      this.persistToDisk();
      return newRetailer;
    }

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

    this.retailers.set(retailer.id, updatedRetailer);
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
        const now = new Date().toISOString();
        this.retailers.set(retailer.id, {
          ...retailer,
          stores: retailer.stores ?? [],
          suppliers: retailer.suppliers ?? [],
          products: retailer.products ?? [],
          profileStatus: retailer.profileStatus ?? 'active',
          createdAt: retailer.createdAt || now,
          updatedAt: retailer.updatedAt || now,
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
