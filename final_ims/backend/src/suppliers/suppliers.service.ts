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
import { SupplierRecord, SupplierDocument } from './supplier-record.interface';
import { ProductsService } from '../products/products.service';
import * as fs from 'fs';

@Injectable()
export class SuppliersService {
  private readonly suppliers = new Map<string, SupplierRecord>();
  private readonly dataDirectory = join(__dirname, '..', '..', 'data');
  private readonly dataFile = join(this.dataDirectory, 'suppliers.json');

  constructor(private readonly productsService: ProductsService) {
    this.loadFromDisk();
  }

  create(createSupplierSetupDto: any): SupplierRecord {
    const now = new Date().toISOString();
    const companyName =
      createSupplierSetupDto.business?.companyName ||
      createSupplierSetupDto.companyName ||
      createSupplierSetupDto.company ||
      createSupplierSetupDto.name ||
      'New Supplier';
    const email =
      createSupplierSetupDto.business?.businessEmail ||
      createSupplierSetupDto.businessEmail ||
      createSupplierSetupDto.email ||
      'supplier@example.com';
    const phone =
      createSupplierSetupDto.business?.phoneNumber ||
      createSupplierSetupDto.phoneNumber ||
      createSupplierSetupDto.phone ||
      '';
    const code =
      createSupplierSetupDto.business?.supplierCode ||
      createSupplierSetupDto.supplierCode ||
      createSupplierSetupDto.code ||
      `SUP-${Math.floor(100 + Math.random() * 900)}`;

    const business = createSupplierSetupDto.business ?? {
      companyName,
      supplierCode: code,
      businessType: createSupplierSetupDto.businessType || 'Wholesaler',
      registrationNumber: createSupplierSetupDto.registrationNumber || '',
      taxId: createSupplierSetupDto.taxId || '',
      businessEmail: email,
      phoneNumber: phone,
      streetAddress: createSupplierSetupDto.streetAddress || createSupplierSetupDto.address || '',
      city: createSupplierSetupDto.city || '',
      state: createSupplierSetupDto.state || '',
      postalCode: createSupplierSetupDto.postalCode || '',
      country: createSupplierSetupDto.country || 'India',
      website: createSupplierSetupDto.website || '',
      primaryCategory: createSupplierSetupDto.primaryCategory || 'General',
      paymentTerms: createSupplierSetupDto.paymentTerms || 'Net 30',
    };

    const primaryContact = createSupplierSetupDto.primaryContact ?? {
      fullName: createSupplierSetupDto.contactPerson || companyName,
      jobTitle: 'Account Manager',
      directEmail: email,
      directPhone: phone,
    };

    const supplier: SupplierRecord = {
      ...createSupplierSetupDto,
      business,
      primaryContact,
      retailers: createSupplierSetupDto.retailers ?? [],
      products: createSupplierSetupDto.products ?? [],
      documents: createSupplierSetupDto.documents ?? [],
      id: createSupplierSetupDto.id || randomUUID(),
      status: 'completed',
      profileStatus: createSupplierSetupDto.profileStatus ?? 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.suppliers.set(supplier.id, supplier);
    this.syncProducts(supplier);
    this.persistToDisk();
    return supplier;
  }

  updateProfileStatus(
    id: string,
    status: 'active' | 'inactive' | 'pending' | 'rejected',
    rejectionReason?: string,
  ): SupplierRecord {
    const supplier = this.findOne(id);
    supplier.profileStatus = status;
    if (status === 'rejected' && rejectionReason) {
      (supplier as any).rejectionReason = rejectionReason;
    } else if (status !== 'rejected') {
      delete (supplier as any).rejectionReason;
    }
    supplier.updatedAt = new Date().toISOString();
    this.suppliers.set(id, supplier);
    this.persistToDisk();
    return supplier;
  }

  findAll(): SupplierRecord[] {
    return Array.from(this.suppliers.values()).sort((a, b) =>
      String(b.updatedAt || b.createdAt || '').localeCompare(
        String(a.updatedAt || a.createdAt || ''),
      ),
    );
  }

  findOne(id: string): SupplierRecord {
    const supplier = this.suppliers.get(id);

    if (!supplier) {
      throw new NotFoundException(`Supplier setup "${id}" was not found`);
    }

    return supplier;
  }

  findLatest(): SupplierRecord | null {
    return this.findAll()[0] ?? null;
  }

  findByBusinessEmail(email: string): SupplierRecord | null {
    const lookup = String(email || '').trim().toLowerCase();
    if (!lookup) {
      return null;
    }

    return (
      this.findAll().find(
        (supplier) =>
          supplier.business?.businessEmail?.toLowerCase() === lookup ||
          supplier.primaryContact?.directEmail?.toLowerCase() === lookup,
      ) ?? null
    );
  }

  update(id: string, updateSupplierSetupDto: any): SupplierRecord {
    const supplier = this.findOne(id);

    const business = {
      ...supplier.business,
      ...(updateSupplierSetupDto.business || {}),
    };
    if (updateSupplierSetupDto.companyName || updateSupplierSetupDto.name) {
      business.companyName = updateSupplierSetupDto.companyName || updateSupplierSetupDto.name;
    }
    if (updateSupplierSetupDto.email || updateSupplierSetupDto.businessEmail) {
      business.businessEmail = updateSupplierSetupDto.email || updateSupplierSetupDto.businessEmail;
    }
    if (updateSupplierSetupDto.phone || updateSupplierSetupDto.phoneNumber) {
      business.phoneNumber = updateSupplierSetupDto.phone || updateSupplierSetupDto.phoneNumber;
    }

    const primaryContact = {
      ...supplier.primaryContact,
      ...(updateSupplierSetupDto.primaryContact || {}),
    };
    if (updateSupplierSetupDto.contactPerson) {
      primaryContact.fullName = updateSupplierSetupDto.contactPerson;
    }

    const updatedSupplier: SupplierRecord = {
      ...supplier,
      ...updateSupplierSetupDto,
      business,
      primaryContact,
      retailers: updateSupplierSetupDto.retailers ?? supplier.retailers,
      products: updateSupplierSetupDto.products ?? supplier.products,
      pricingPolicies:
        updateSupplierSetupDto.pricingPolicies ?? supplier.pricingPolicies,
      bankDetails: updateSupplierSetupDto.bankDetails ?? supplier.bankDetails,
      profileStatus:
        updateSupplierSetupDto.profileStatus ?? supplier.profileStatus ?? 'active',
      updatedAt: new Date().toISOString(),
    };

    this.suppliers.set(id, updatedSupplier);
    this.syncProducts(updatedSupplier);
    this.persistToDisk();
    return updatedSupplier;
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

  addDocument(
    supplierId: string,
    file: any,
    docType: string = 'General Document',
  ): SupplierDocument {
    const supplier = this.findOne(supplierId);
    const docId = `DOC-${randomUUID().slice(0, 8)}`;
    const relativeUrl = `/uploads/suppliers/${file.filename}`;

    const newDoc: SupplierDocument = {
      id: docId,
      docType,
      originalName: file.originalname,
      filename: file.filename,
      url: relativeUrl,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    const documents = [...(supplier.documents || []), newDoc];
    const updatedSupplier: SupplierRecord = {
      ...supplier,
      documents,
      updatedAt: new Date().toISOString(),
    };

    this.suppliers.set(supplier.id, updatedSupplier);
    this.persistToDisk();
    return newDoc;
  }

  getDocuments(supplierId: string): SupplierDocument[] {
    const supplier = this.findOne(supplierId);
    return supplier.documents || [];
  }

  removeDocument(supplierId: string, docId: string): void {
    const supplier = this.findOne(supplierId);
    const existingDocs = supplier.documents || [];
    const targetDoc = existingDocs.find((doc) => doc.id === docId);

    if (!targetDoc) {
      throw new NotFoundException(`Document "${docId}" was not found`);
    }

    // Try to delete physical file from disk
    try {
      const filePath = join(process.cwd(), 'uploads', 'suppliers', targetDoc.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Failed to delete physical file for doc ${docId}:`, err);
    }

    const updatedDocs = existingDocs.filter((doc) => doc.id !== docId);
    const updatedSupplier: SupplierRecord = {
      ...supplier,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };

    this.suppliers.set(supplier.id, updatedSupplier);
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
        const now = new Date().toISOString();
        this.suppliers.set(supplier.id, {
          ...supplier,
          retailers: supplier.retailers ?? [],
          products: supplier.products ?? [],
          documents: supplier.documents ?? [],
          profileStatus: supplier.profileStatus ?? 'active',
          createdAt: supplier.createdAt || now,
          updatedAt: supplier.updatedAt || now,
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
}
