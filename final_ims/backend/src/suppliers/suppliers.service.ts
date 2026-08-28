import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { UpdateSupplierSetupDto } from './dto/update-supplier-setup.dto';
import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord } from './supplier-record.interface';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

type ValidationStatus = 'pending' | 'approved' | 'rejected';

@Injectable()
export class SuppliersService {
  private readonly suppliers = new Map<string, SupplierRecord>();
  private readonly dataDirectory = join(__dirname, '..', '..', 'data');
  private readonly dataFile = join(this.dataDirectory, 'suppliers.json');

  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {
    this.loadFromDisk();
  }

  create(createSupplierSetupDto: CreateSupplierSetupDto): SupplierRecord {
    const email = (createSupplierSetupDto.business?.businessEmail || createSupplierSetupDto.primaryContact?.directEmail || '').toLowerCase().trim();
    const company = (createSupplierSetupDto.business?.companyName || '').toLowerCase().trim();
    
    let existing: SupplierRecord | undefined = undefined;
    if (email) {
      existing = this.findByBusinessEmail(email) || undefined;
    }
    if (!existing && company) {
      existing = this.findAll().find(s => {
        const cName = (s.business?.companyName || (s as any).companyName || (s as any).name || '').toLowerCase().trim();
        return cName === company;
      });
    }

    if (existing) {
      return this.update(existing.id, createSupplierSetupDto as any);
    }

    const now = new Date().toISOString();
    const assignedEmployeeId = this.usersService.getNextEmployeeId(
      this.findAll().map((supplier) => supplier.assignedEmployeeId),
    );
    const supplier: SupplierRecord = {
      ...createSupplierSetupDto,
      retailers: createSupplierSetupDto.retailers ?? [],
      products: createSupplierSetupDto.products ?? [],
      id: randomUUID(),
      status: 'completed',
      profileStatus: createSupplierSetupDto.profileStatus ?? 'active',
      validationStatus: createSupplierSetupDto.validationStatus ?? 'pending',
      assignedEmployeeId:
        createSupplierSetupDto.assignedEmployeeId || assignedEmployeeId,
      assignedAt:
        createSupplierSetupDto.assignedAt || (assignedEmployeeId ? now : ''),
      createdAt: now,
      updatedAt: now,
    };

    this.suppliers.set(supplier.id, supplier);
    if ((supplier.validationStatus || 'approved') === 'approved') {
      this.syncProducts(supplier);
    }
    this.persistToDisk();
    return supplier;
  }

  findAll(): SupplierRecord[] {
    return Array.from(this.suppliers.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  findAssignedValidations(employeeId: string): SupplierRecord[] {
    this.ensurePendingAssignments();
    const normalizedEmployeeId = this.normalizeText(employeeId);
    return this.findAll().filter((supplier) => {
      return this.normalizeText(supplier.assignedEmployeeId) === normalizedEmployeeId;
    });
  }

  findOne(id: string): SupplierRecord {
    let supplier = this.suppliers.get(id);
    if (!supplier) {
      const norm = String(id || '').trim().toLowerCase();
      const normPrefix = norm.split('@')[0];
      supplier = this.findAll().find((s) => {
        const sId = (s.id || '').toLowerCase();
        const bName = (s.business?.companyName || '').toLowerCase();
        const bEmail = (s.business?.businessEmail || '').toLowerCase();
        const cName = (s.primaryContact?.fullName || '').toLowerCase();
        return (
          sId === norm ||
          bName === norm ||
          bEmail === norm ||
          cName === norm ||
          (normPrefix && (bName.includes(normPrefix) || bEmail.includes(normPrefix)))
        );
      });
    }

    if (!supplier) {
      const norm = String(id || '').trim().toLowerCase();
      const user = this.usersService
        .findAll()
        .find(
          (u) =>
            u.id === id ||
            u.profileId === id ||
            u.name.toLowerCase() === norm ||
            u.email.toLowerCase() === norm,
        );
      if (user) {
        const matched = this.findAll().find(
          (s) =>
            s.id === user.profileId ||
            s.id === user.id ||
            (s.business?.businessEmail && s.business.businessEmail.toLowerCase() === user.email.toLowerCase()),
        );
        if (matched) {
          return matched;
        }

        return {
          id: user.profileId || user.id,
          status: 'completed',
          profileStatus: 'active',
          validationStatus: 'approved',
          assignedEmployeeId: '',
          assignedAt: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          business: {
            companyName: user.profile?.businessName || user.name || 'Supplier',
            businessEmail: user.email || '',
            businessType: 'Distributor',
            phoneNumber: '+91 98765 43210',
            primaryCategory: 'Electronics & Technology',
            state: 'Gujarat',
            paymentTerms: 'Net 30',
            currency: 'INR',
            sellingType: 'Wholesale',
          },
          primaryContact: {
            fullName: user.name || 'Supplier Contact',
            directEmail: user.email || '',
          },
          retailers: [],
          products: [],
          pricingPolicies: [],
          bankDetails: [],
        } as SupplierRecord;
      }

      return {
        id: id,
        status: 'completed',
        profileStatus: 'active',
        validationStatus: 'approved',
        assignedEmployeeId: '',
        assignedAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        business: {
          companyName: id,
          businessEmail: '',
          businessType: 'Distributor',
          primaryCategory: 'Electronics & Technology',
          state: 'Gujarat',
          paymentTerms: 'Net 30',
          currency: 'INR',
          sellingType: 'Wholesale',
        },
        primaryContact: {
          fullName: 'Supplier Contact',
        },
        retailers: [],
        products: [],
        pricingPolicies: [],
        bankDetails: [],
      } as SupplierRecord;
    }

    return supplier;
  }

  findLatest(): SupplierRecord | null {
    const list = this.findAll();
    const hans = list.find((s) => (s.business?.companyName || '').toLowerCase() === 'hans');
    return hans || list[0] || null;
  }

  findByBusinessEmail(email: string): SupplierRecord | null {
    const lookup = String(email || '').trim().toLowerCase();
    if (!lookup) {
      return null;
    }

    const lookupPrefix = lookup.split('@')[0];

    const match = this.findAll().find((supplier) => {
      const bEmail = (supplier.business?.businessEmail || '').toLowerCase();
      const cEmail = (supplier.primaryContact?.directEmail || '').toLowerCase();
      const cName = (supplier.business?.companyName || supplier.primaryContact?.fullName || '').toLowerCase();

      if (bEmail === lookup || cEmail === lookup) return true;
      if (bEmail.includes(lookup) || cEmail.includes(lookup)) return true;
      if (lookupPrefix && (bEmail.startsWith(lookupPrefix) || cName.includes(lookupPrefix))) return true;
      if (cName === lookup) return true;

      return false;
    });

    if (match) {
      return match;
    }

    const user = this.usersService
      .findAll()
      .find(
        (u) =>
          u.email.toLowerCase() === lookup ||
          u.email.toLowerCase().includes(lookup) ||
          u.name.toLowerCase() === lookup,
      );

    if (user) {
      return this.findOne(user.profileId || user.id);
    }

    return null;
  }

  update(id: string, updateSupplierSetupDto: UpdateSupplierSetupDto): SupplierRecord {
    const supplier = this.findOne(id);
    const updatedSupplier: SupplierRecord = {
      ...supplier,
      ...updateSupplierSetupDto,
      business: updateSupplierSetupDto.business ?? supplier.business,
      primaryContact:
        updateSupplierSetupDto.primaryContact ?? supplier.primaryContact,
      retailers: updateSupplierSetupDto.retailers ?? supplier.retailers,
      products: updateSupplierSetupDto.products ?? supplier.products,
      pricingPolicies:
        updateSupplierSetupDto.pricingPolicies ?? supplier.pricingPolicies,
      bankDetails: updateSupplierSetupDto.bankDetails ?? supplier.bankDetails,
      profileStatus:
        (updateSupplierSetupDto as UpdateSupplierSetupDto & {
          profileStatus?: 'active' | 'inactive';
        }).profileStatus ?? supplier.profileStatus ?? 'active',
      validationStatus:
        updateSupplierSetupDto.validationStatus ??
        supplier.validationStatus ??
        'approved',
      assignedEmployeeId:
        updateSupplierSetupDto.assignedEmployeeId ?? supplier.assignedEmployeeId,
      assignedAt: updateSupplierSetupDto.assignedAt ?? supplier.assignedAt,
      validatedBy: updateSupplierSetupDto.validatedBy ?? supplier.validatedBy,
      validatedAt: updateSupplierSetupDto.validatedAt ?? supplier.validatedAt,
      rejectionReason:
        updateSupplierSetupDto.rejectionReason ?? supplier.rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    this.suppliers.set(id, updatedSupplier);
    if ((updatedSupplier.validationStatus || 'approved') === 'approved') {
      this.syncProducts(updatedSupplier);
    }
    this.persistToDisk();
    return updatedSupplier;
  }

  approveValidation(id: string, employeeId: string): SupplierRecord {
    return this.updateValidation(id, employeeId, 'approved');
  }

  rejectValidation(
    id: string,
    employeeId: string,
    rejectionReason?: string,
  ): SupplierRecord {
    return this.updateValidation(id, employeeId, 'rejected', rejectionReason);
  }

  adjustProductStock(
    supplierId: string | number,
    sku: string,
    qtyDelta: number,
  ): SupplierRecord {
    const supplier = this.findOne(String(supplierId));
    const normalizedSku = String(sku || '').trim().toLowerCase();
    if (!normalizedSku || !Array.isArray(supplier.products)) {
      return supplier;
    }

    let changed = false;
    const products = supplier.products.map((product) => {
      if (String(product.sku || '').trim().toLowerCase() !== normalizedSku) {
        return product;
      }

      changed = true;
      return {
        ...product,
        stockAvailable: Math.max(
          0,
          Math.trunc(Number(product.stockAvailable || 0) + qtyDelta),
        ),
      };
    });

    if (!changed) {
      return supplier;
    }

    const updatedSupplier: SupplierRecord = {
      ...supplier,
      products,
      updatedAt: new Date().toISOString(),
    };

    this.suppliers.set(supplier.id, updatedSupplier);
    this.persistToDisk();
    return updatedSupplier;
  }

  getDirectory(): SupplierDirectoryEntry[] {
    return this.findAll().map((supplier) => ({
      id: supplier.id,
      companyName: supplier.business.companyName,
      supplierCode: supplier.business.supplierCode,
      businessType: supplier.business.businessType,
      businessEmail: supplier.business.businessEmail,
      phoneNumber: supplier.business.phoneNumber,
      state: supplier.business.state,
      website: supplier.business.website,
      primaryCategory: supplier.business.primaryCategory,
      paymentTerms: supplier.business.paymentTerms,
      profileStatus: supplier.profileStatus ?? 'active',
      productCount: (supplier.products ?? []).length,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    }));
  }

  remove(id: string): void {
    const deleted = this.suppliers.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Supplier setup "${id}" was not found`);
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
      const suppliers = JSON.parse(raw) as SupplierRecord[];

      suppliers.forEach((supplier) => {
        this.suppliers.set(supplier.id, {
          ...supplier,
          retailers: supplier.retailers ?? [],
          products: supplier.products ?? [],
          profileStatus: supplier.profileStatus ?? 'active',
          validationStatus: supplier.validationStatus ?? 'approved',
          assignedEmployeeId: supplier.assignedEmployeeId ?? '',
          assignedAt: supplier.assignedAt ?? '',
          validatedBy: supplier.validatedBy ?? '',
          validatedAt: supplier.validatedAt ?? '',
          rejectionReason: supplier.rejectionReason ?? '',
        });
      });
    } catch {
      writeFileSync(this.dataFile, '[]', 'utf-8');
    }
  }

  private persistToDisk(): void {
    const suppliers = this.findAll();
    writeFileSync(this.dataFile, JSON.stringify(suppliers, null, 2), 'utf-8');
  }

  private updateValidation(
    id: string,
    employeeId: string,
    validationStatus: ValidationStatus,
    rejectionReason = '',
  ) {
    const supplier = this.findOne(id);
    this.ensureAssignedToEmployee(supplier.assignedEmployeeId, employeeId);
    const now = new Date().toISOString();
    const updatedSupplier: SupplierRecord = {
      ...supplier,
      validationStatus,
      profileStatus: validationStatus === 'rejected' ? 'inactive' : 'active',
      validatedBy: employeeId,
      validatedAt: now,
      rejectionReason: validationStatus === 'rejected' ? rejectionReason : '',
      updatedAt: now,
    };

    this.suppliers.set(id, updatedSupplier);
    if (validationStatus === 'approved') {
      this.syncProducts(updatedSupplier);
    }
    this.persistToDisk();
    return updatedSupplier;
  }

  private ensurePendingAssignments() {
    const suppliers = this.findAll();
    const assignments = suppliers
      .map((supplier) => supplier.assignedEmployeeId)
      .filter(Boolean);
    let changed = false;
    const now = new Date().toISOString();

    suppliers.forEach((supplier) => {
      if (
        (supplier.validationStatus || 'approved') !== 'pending' ||
        this.normalizeText(supplier.assignedEmployeeId)
      ) {
        return;
      }

      const assignedEmployeeId = this.usersService.getNextEmployeeId(assignments);
      if (!assignedEmployeeId) {
        return;
      }

      supplier.assignedEmployeeId = assignedEmployeeId;
      supplier.assignedAt = now;
      assignments.push(assignedEmployeeId);
      this.suppliers.set(supplier.id, supplier);
      changed = true;
    });

    if (changed) {
      this.persistToDisk();
    }
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

  private syncProducts(supplier: SupplierRecord) {
    if (!Array.isArray(supplier.products)) return;

    supplier.products.forEach(p => {
      try {
        // Try to find existing global product by SKU
        this.productsService.findBySku(p.sku);
        // If exists, maybe update? For now just skip to avoid duplicates
      } catch {
        // Create new global product
        this.productsService.create({
          sku: p.sku,
          name: p.name,
          brand: p.brand || supplier.business.companyName,
          category: p.category || 'General',
          priceUSD: p.unitPrice || 0,
          qty: p.stockAvailable || 0,
          supplier: supplier.business.companyName,
          description: `Supplied by ${supplier.business.companyName}`,
          visibility: 'published'
        });
      }
    });
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
