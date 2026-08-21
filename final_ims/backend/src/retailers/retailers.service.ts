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
import { UsersService } from '../users/users.service';

type ValidationStatus = 'pending' | 'approved' | 'rejected';

@Injectable()
export class RetailersService {
  private readonly retailers = new Map<string, RetailerRecord>();
  private readonly dataDirectory = join(__dirname, '..', '..', 'data');
  private readonly dataFile = join(this.dataDirectory, 'retailers.json');

  constructor(private readonly usersService: UsersService) {
    this.loadFromDisk();
  }

  create(createRetailerSetupDto: CreateRetailerSetupDto): RetailerRecord {
    const now = new Date().toISOString();
    const profileAssignment = this.usersService.getNextEmployeeId(
      this.findAll().map((retailer) => retailer.assignedEmployeeId),
    );
    const storeAssignments = this.collectStoreAssignmentIds();
    const stores = (createRetailerSetupDto.stores ?? []).map((store, index) => {
      const assignedEmployeeId = this.usersService.getNextEmployeeId(
        storeAssignments,
      );
      if (assignedEmployeeId) {
        storeAssignments.push(assignedEmployeeId);
      }

      return {
        ...store,
        code: store.code || `STORE-${index + 1}`,
        status: store.status || 'active',
        validationStatus: store.validationStatus ?? 'pending',
        assignedEmployeeId: store.assignedEmployeeId || assignedEmployeeId,
        assignedAt: store.assignedAt || (assignedEmployeeId ? now : ''),
      };
    });
    const retailer: RetailerRecord = {
      ...createRetailerSetupDto,
      stores,
      suppliers: createRetailerSetupDto.suppliers ?? [],
      products: createRetailerSetupDto.products ?? [],
      id: randomUUID(),
      status: 'completed',
      profileStatus: createRetailerSetupDto.profileStatus ?? 'active',
      validationStatus: createRetailerSetupDto.validationStatus ?? 'pending',
      assignedEmployeeId:
        createRetailerSetupDto.assignedEmployeeId || profileAssignment,
      assignedAt:
        createRetailerSetupDto.assignedAt || (profileAssignment ? now : ''),
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

  findAssignedValidations(employeeId: string): RetailerRecord[] {
    this.ensurePendingAssignments();
    const normalizedEmployeeId = this.normalizeText(employeeId);
    return this.findAll().filter((retailer) => {
      return this.normalizeText(retailer.assignedEmployeeId) === normalizedEmployeeId;
    });
  }

  findAssignedStoreValidations(employeeId: string) {
    this.ensurePendingAssignments();
    const normalizedEmployeeId = this.normalizeText(employeeId);
    return this.findAll().flatMap((retailer) => {
      return (retailer.stores || [])
        .map((store, index) => ({
          id: `${retailer.id}:${store.code || index + 1}`,
          retailerId: retailer.id,
          retailerName: retailer.business.businessName,
          businessEmail: retailer.business.businessEmail,
          storeCode: store.code || `STORE-${index + 1}`,
          storeName: store.name,
          contactPerson: store.contactPerson || retailer.primaryContact.fullName,
          phone: store.phone || '',
          address: store.address || '',
          status: store.status || 'active',
          validationStatus: store.validationStatus || 'approved',
          assignedEmployeeId: store.assignedEmployeeId || '',
          assignedAt: store.assignedAt || '',
          validatedBy: store.validatedBy || '',
          validatedAt: store.validatedAt || '',
          rejectionReason: store.rejectionReason || '',
          createdAt: retailer.createdAt,
          updatedAt: retailer.updatedAt,
        }))
        .filter((store) => store.assignedEmployeeId === normalizedEmployeeId);
    });
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
      validationStatus:
        updateRetailerSetupDto.validationStatus ??
        retailer.validationStatus ??
        'approved',
      assignedEmployeeId:
        updateRetailerSetupDto.assignedEmployeeId ?? retailer.assignedEmployeeId,
      assignedAt: updateRetailerSetupDto.assignedAt ?? retailer.assignedAt,
      validatedBy: updateRetailerSetupDto.validatedBy ?? retailer.validatedBy,
      validatedAt: updateRetailerSetupDto.validatedAt ?? retailer.validatedAt,
      rejectionReason:
        updateRetailerSetupDto.rejectionReason ?? retailer.rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    this.retailers.set(id, updatedRetailer);
    this.persistToDisk();
    return updatedRetailer;
  }

  approveValidation(id: string, employeeId: string): RetailerRecord {
    return this.updateValidation(id, employeeId, 'approved');
  }

  rejectValidation(
    id: string,
    employeeId: string,
    rejectionReason?: string,
  ): RetailerRecord {
    return this.updateValidation(id, employeeId, 'rejected', rejectionReason);
  }

  approveStoreValidation(retailerId: string, storeCode: string, employeeId: string) {
    return this.updateStoreValidation(
      retailerId,
      storeCode,
      employeeId,
      'approved',
    );
  }

  rejectStoreValidation(
    retailerId: string,
    storeCode: string,
    employeeId: string,
    rejectionReason?: string,
  ) {
    return this.updateStoreValidation(
      retailerId,
      storeCode,
      employeeId,
      'rejected',
      rejectionReason,
    );
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
          stores: (retailer.stores ?? []).map((store, index) => ({
            ...store,
            code: store.code || `STORE-${index + 1}`,
            validationStatus: store.validationStatus || 'approved',
            assignedEmployeeId: store.assignedEmployeeId || '',
            assignedAt: store.assignedAt || '',
            validatedBy: store.validatedBy || '',
            validatedAt: store.validatedAt || '',
            rejectionReason: store.rejectionReason || '',
          })),
          suppliers: retailer.suppliers ?? [],
          products: retailer.products ?? [],
          profileStatus: retailer.profileStatus ?? 'active',
          validationStatus: retailer.validationStatus ?? 'approved',
          assignedEmployeeId: retailer.assignedEmployeeId ?? '',
          assignedAt: retailer.assignedAt ?? '',
          validatedBy: retailer.validatedBy ?? '',
          validatedAt: retailer.validatedAt ?? '',
          rejectionReason: retailer.rejectionReason ?? '',
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

  private updateValidation(
    id: string,
    employeeId: string,
    validationStatus: ValidationStatus,
    rejectionReason = '',
  ) {
    const retailer = this.findOne(id);
    this.ensureAssignedToEmployee(retailer.assignedEmployeeId, employeeId);
    const now = new Date().toISOString();
    const updatedRetailer: RetailerRecord = {
      ...retailer,
      validationStatus,
      profileStatus: validationStatus === 'rejected' ? 'inactive' : 'active',
      validatedBy: employeeId,
      validatedAt: now,
      rejectionReason: validationStatus === 'rejected' ? rejectionReason : '',
      updatedAt: now,
    };

    this.retailers.set(id, updatedRetailer);
    this.persistToDisk();
    return updatedRetailer;
  }

  private updateStoreValidation(
    retailerId: string,
    storeCode: string,
    employeeId: string,
    validationStatus: ValidationStatus,
    rejectionReason = '',
  ) {
    const retailer = this.findOne(retailerId);
    const normalizedStoreCode = this.normalizeText(storeCode).toLowerCase();
    const storeIndex = (retailer.stores || []).findIndex((store, index) => {
      const code = this.normalizeText(store.code, `STORE-${index + 1}`).toLowerCase();
      return code === normalizedStoreCode;
    });

    if (storeIndex === -1) {
      throw new NotFoundException('Store validation not found');
    }

    const store = retailer.stores[storeIndex];
    this.ensureAssignedToEmployee(store.assignedEmployeeId, employeeId);
    const now = new Date().toISOString();
    const stores = retailer.stores.map((entry, index) => {
      if (index !== storeIndex) {
        return entry;
      }

      return {
        ...entry,
        validationStatus,
        status:
          validationStatus === 'rejected'
            ? ('inactive' as const)
            : ('active' as const),
        validatedBy: employeeId,
        validatedAt: now,
        rejectionReason: validationStatus === 'rejected' ? rejectionReason : '',
      };
    });

    const updatedRetailer: RetailerRecord = {
      ...retailer,
      stores,
      updatedAt: now,
    };

    this.retailers.set(retailerId, updatedRetailer);
    this.persistToDisk();
    return this.findAssignedStoreValidations(employeeId).find((entry) => {
      return (
        entry.retailerId === retailerId &&
        entry.storeCode.toLowerCase() === normalizedStoreCode
      );
    });
  }

  private ensurePendingAssignments() {
    const retailers = this.findAll();
    const profileAssignments = retailers
      .map((retailer) => retailer.assignedEmployeeId)
      .filter(Boolean);
    const storeAssignments = this.collectStoreAssignmentIds();
    let changed = false;
    const now = new Date().toISOString();

    retailers.forEach((retailer) => {
      if (
        (retailer.validationStatus || 'approved') === 'pending' &&
        !this.normalizeText(retailer.assignedEmployeeId)
      ) {
        const assignedEmployeeId =
          this.usersService.getNextEmployeeId(profileAssignments);
        if (assignedEmployeeId) {
          retailer.assignedEmployeeId = assignedEmployeeId;
          retailer.assignedAt = now;
          profileAssignments.push(assignedEmployeeId);
          changed = true;
        }
      }

      retailer.stores = (retailer.stores || []).map((store, index) => {
        if (
          (store.validationStatus || 'approved') !== 'pending' ||
          this.normalizeText(store.assignedEmployeeId)
        ) {
          return store;
        }

        const assignedEmployeeId =
          this.usersService.getNextEmployeeId(storeAssignments);
        if (!assignedEmployeeId) {
          return store;
        }

        storeAssignments.push(assignedEmployeeId);
        changed = true;
        return {
          ...store,
          code: store.code || `STORE-${index + 1}`,
          assignedEmployeeId,
          assignedAt: now,
        };
      });

      this.retailers.set(retailer.id, retailer);
    });

    if (changed) {
      this.persistToDisk();
    }
  }

  private collectStoreAssignmentIds() {
    return this.findAll().flatMap((retailer) => {
      return (retailer.stores || [])
        .map((store) => store.assignedEmployeeId)
        .filter(Boolean);
    });
  }

  private ensureAssignedToEmployee(
    assignedEmployeeId: string | undefined,
    employeeId: string,
  ) {
    if (
      !this.normalizeText(assignedEmployeeId) ||
      this.normalizeText(assignedEmployeeId) !== this.normalizeText(employeeId)
    ) {
      throw new NotFoundException('Assigned validation not found');
    }
  }

  private normalizeText(...values: unknown[]) {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }
}
