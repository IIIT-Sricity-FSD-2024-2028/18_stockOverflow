import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type PublicUser = Omit<User, 'password'>;
type RetailerProfileRecord = {
  id: string;
  profileStatus?: string;
  business?: {
    businessName?: string;
    businessType?: string;
    businessEmail?: string;
    phoneNumber?: string;
    taxId?: string;
    retailerCode?: string;
    currency?: string;
    fiscalYear?: string;
    businessAddress?: string;
    website?: string;
    primaryIndustry?: string;
  };
  primaryContact?: {
    fullName?: string;
    designation?: string;
    directEmail?: string;
  };
  stores?: Array<{
    name?: string;
    code?: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    type?: string;
    status?: string;
  }>;
  suppliers?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
};
type SupplierProfileRecord = {
  id: string;
  profileStatus?: string;
  business?: {
    companyName?: string;
    businessType?: string;
    businessEmail?: string;
    phoneNumber?: string;
    supplierCode?: string;
    currency?: string;
    businessAddress?: string;
    website?: string;
    primaryCategory?: string;
    paymentTerms?: string;
    sellingType?: string;
    description?: string;
    state?: string;
  };
  primaryContact?: {
    fullName?: string;
    designation?: string;
    directEmail?: string;
  };
  retailers?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
};

const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin-1',
    name: 'System Administrator',
    email: 'admin@stockoverflow.com',
    password: 'pass1234',
    role: 'admin',
    status: 'Active',
    store: 'Global Hub',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-retailer-1',
    name: 'Primary Retailer',
    email: 'retailer@stockoverflow.com',
    password: 'pass1234',
    role: 'retailer',
    status: 'Active',
    store: '',
    accessibleStoreIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-supplier-1',
    name: 'Primary Supplier',
    email: 'supplier@stockoverflow.com',
    password: 'pass1234',
    role: 'supplier',
    status: 'Active',
    store: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-consumer-1',
    name: 'Primary Customer',
    email: 'customer@stockoverflow.com',
    password: 'pass1234',
    role: 'consumer',
    status: 'Active',
    store: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();
  private readonly dataDirectory = join(__dirname, '..', '..', 'data');
  private readonly dataFile = join(this.dataDirectory, 'users.json');
  private readonly retailersFile = join(this.dataDirectory, 'retailers.json');
  private readonly suppliersFile = join(this.dataDirectory, 'suppliers.json');

  constructor() {
    this.loadFromDisk();
  }

  findAll(role?: string, email?: string): PublicUser[] {
    const normalizedRoleRaw = this.normalizeText(role).toLowerCase();
    const normalizedRole =
      normalizedRoleRaw === 'customer' ? 'consumer' : normalizedRoleRaw;
    const normalizedEmail = this.normalizeEmail(email || '');
    return this.readAll()
      .filter((user) => {
        if (normalizedRole && user.role !== normalizedRole) {
          return false;
        }
        if (normalizedEmail && this.normalizeEmail(user.email) !== normalizedEmail) {
          return false;
        }
        return true;
      })
      .sort((left, right) => {
        return String(right.updatedAt || '').localeCompare(
          String(left.updatedAt || ''),
        );
      })
      .map((user) => this.toPublicUser(this.hydrateLinkedProfile(user)));
  }

  findOne(id: string): PublicUser {
    return this.toPublicUser(this.syncLinkedProfileForUserId(id));
  }

  create(createUserDto: CreateUserDto): PublicUser {
    const users = this.readAll();
    const email = this.normalizeEmail(createUserDto.email);
    const role = this.normalizeRole(createUserDto.role);

    if (
      users.some((entry) => this.normalizeEmail(entry.email) === email)
    ) {
      throw new ConflictException('Email already exists');
    }

    const now = new Date().toISOString();
    const created: User = {
      id: randomUUID(),
      name: this.normalizeText(createUserDto.name, 'User'),
      email,
      password: this.normalizeText(createUserDto.password),
      role,
      status: this.normalizeText(createUserDto.status, 'Active'),
      store: this.normalizeText(createUserDto.store),
      storeId: this.normalizeText(createUserDto.storeId),
      currentStoreId: this.normalizeText(
        createUserDto.currentStoreId,
        createUserDto.storeId,
      ),
      accessibleStoreIds: this.normalizeStringList(
        createUserDto.accessibleStoreIds,
      ),
      profileId: this.normalizeText(createUserDto.profileId),
      profile: this.normalizeProfile(createUserDto.profile),
      createdAt: now,
      updatedAt: now,
    };

    const hydrated = this.hydrateLinkedProfile(created);
    users.unshift(hydrated);
    this.writeAll(users);
    return this.toPublicUser(hydrated);
  }

  update(id: string, updateUserDto: UpdateUserDto): PublicUser {
    const users = this.readAll();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    const existing = users[index];
    const nextEmail = this.normalizeEmail(updateUserDto.email || existing.email);

    if (
      users.some(
        (entry) =>
          entry.id !== id && this.normalizeEmail(entry.email) === nextEmail,
      )
    ) {
      throw new ConflictException('Email already exists');
    }

    const updated: User = {
      ...existing,
      ...updateUserDto,
      name: this.normalizeText(updateUserDto.name, existing.name),
      email: nextEmail,
      password: this.normalizeText(updateUserDto.password, existing.password),
      role: this.normalizeRole(updateUserDto.role || existing.role),
      status: this.normalizeText(updateUserDto.status, existing.status || 'Active'),
      store: this.normalizeText(updateUserDto.store, existing.store),
      storeId: this.normalizeText(updateUserDto.storeId, existing.storeId),
      currentStoreId: this.normalizeText(
        updateUserDto.currentStoreId,
        existing.currentStoreId,
        updateUserDto.storeId,
        existing.storeId,
      ),
      accessibleStoreIds:
        updateUserDto.accessibleStoreIds != null
          ? this.normalizeStringList(updateUserDto.accessibleStoreIds)
          : this.normalizeStringList(existing.accessibleStoreIds),
      profileId: this.normalizeText(updateUserDto.profileId, existing.profileId),
      profile:
        updateUserDto.profile !== undefined
          ? this.normalizeProfile(updateUserDto.profile)
          : this.normalizeProfile(existing.profile),
      updatedAt: new Date().toISOString(),
    };

    const hydrated = this.hydrateLinkedProfile(updated);
    users[index] = hydrated;
    this.writeAll(users);
    return this.toPublicUser(hydrated);
  }

  updateProfile(id: string, profile: Record<string, unknown>): PublicUser {
    return this.update(id, { profile } as UpdateUserDto);
  }

  remove(id: string): boolean {
    const users = this.readAll();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    users.splice(index, 1);
    this.writeAll(users);
    return true;
  }

  login(email: string, password: string): PublicUser {
    const normalizedEmail = this.normalizeEmail(email);
    const user = this.readAll().find((entry) => {
      return (
        this.normalizeEmail(entry.email) === normalizedEmail &&
        entry.password === password
      );
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (this.normalizeText(user.status, 'Active') !== 'Active') {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.toPublicUser(this.syncLinkedProfileForUserId(user.id));
  }

  private syncLinkedProfileForUserId(id: string) {
    const users = this.readAll();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    const current = users[index];
    const hydrated = this.hydrateLinkedProfile(current);
    if (!this.hasLinkedProfileChanges(current, hydrated)) {
      return hydrated;
    }

    users[index] = {
      ...hydrated,
      updatedAt: new Date().toISOString(),
    };
    this.writeAll(users);
    return users[index];
  }

  private hydrateLinkedProfile(user: User) {
    const normalized = this.normalizeStoredUser(user);
    if (normalized.role === 'retailer') {
      return this.hydrateRetailerProfile(normalized);
    }
    if (normalized.role === 'supplier') {
      return this.hydrateSupplierProfile(normalized);
    }
    return normalized;
  }

  private hydrateRetailerProfile(user: User) {
    const retailer = this.findRetailerProfile(user);
    if (!retailer) {
      return this.normalizeStoredUser({
        ...user,
        profileId: '',
        profile: undefined,
        store: '',
        storeId: '',
        currentStoreId: '',
        accessibleStoreIds: [],
      });
    }

    const stores = this.normalizeRetailerStores(retailer);
    const accessibleStoreIds = stores
      .map((store) => store.code)
      .filter(Boolean);
    const currentStoreId = this.normalizeText(
      user.currentStoreId,
      user.storeId,
      accessibleStoreIds[0],
    );
    const resolvedStoreId = accessibleStoreIds.includes(currentStoreId)
      ? currentStoreId
      : accessibleStoreIds[0] || '';
    const currentStore =
      stores.find((store) => store.code === resolvedStoreId) || null;

    return this.normalizeStoredUser({
      ...user,
      profileId: retailer.id,
      profile: this.buildRetailerProfileSummary(retailer, user.name),
      store: currentStore?.name || '',
      storeId: resolvedStoreId,
      currentStoreId: resolvedStoreId,
      accessibleStoreIds,
    });
  }

  private hydrateSupplierProfile(user: User) {
    const supplier = this.findSupplierProfile(user);
    if (!supplier) {
      return this.normalizeStoredUser({
        ...user,
        profileId: '',
        profile: undefined,
      });
    }

    return this.normalizeStoredUser({
      ...user,
      profileId: supplier.id,
      profile: this.buildSupplierProfileSummary(supplier, user.name),
    });
  }

  private findRetailerProfile(user: User) {
    const retailers = this.readRecordsFromFile<RetailerProfileRecord>(
      this.retailersFile,
    );
    const lookupId = this.normalizeText(user.profileId);
    const lookupEmail = this.normalizeEmail(user.email);

    return (
      retailers.find((retailer) => retailer.id === lookupId) ||
      retailers.find((retailer) => {
        return (
          this.normalizeEmail(retailer.business?.businessEmail) === lookupEmail ||
          this.normalizeEmail(retailer.primaryContact?.directEmail) === lookupEmail
        );
      }) ||
      null
    );
  }

  private findSupplierProfile(user: User) {
    const suppliers = this.readRecordsFromFile<SupplierProfileRecord>(
      this.suppliersFile,
    );
    const lookupId = this.normalizeText(user.profileId);
    const lookupEmail = this.normalizeEmail(user.email);

    return (
      suppliers.find((supplier) => supplier.id === lookupId) ||
      suppliers.find((supplier) => {
        return (
          this.normalizeEmail(supplier.business?.businessEmail) === lookupEmail ||
          this.normalizeEmail(supplier.primaryContact?.directEmail) === lookupEmail
        );
      }) ||
      null
    );
  }

  private normalizeRetailerStores(retailer: RetailerProfileRecord) {
    return (retailer.stores || []).map((store, index) => ({
      name: this.normalizeText(store.name, `Store ${index + 1}`),
      code: this.normalizeText(store.code, `STORE-${index + 1}`),
      contactPerson: this.normalizeText(store.contactPerson),
      phone: this.normalizeText(store.phone),
      address: this.normalizeText(store.address),
      type: this.normalizeText(store.type, 'Retail Store'),
      status: this.normalizeText(store.status, 'active'),
    }));
  }

  private buildRetailerProfileSummary(
    retailer: RetailerProfileRecord,
    userName: string,
  ) {
    const business = retailer.business || {};
    const primaryContact = retailer.primaryContact || {};
    const stores = this.normalizeRetailerStores(retailer);

    return {
      businessName: this.normalizeText(business.businessName),
      businessEmail: this.normalizeText(business.businessEmail),
      businessPhone: this.normalizeText(business.phoneNumber),
      taxId: this.normalizeText(business.taxId),
      retailerCode: this.normalizeText(business.retailerCode),
      address: this.normalizeText(business.businessAddress),
      website: this.normalizeText(business.website),
      businessType: this.normalizeText(business.businessType),
      currency: this.normalizeText(business.currency),
      fiscalYear: this.normalizeText(business.fiscalYear),
      primaryIndustry: this.normalizeText(business.primaryIndustry),
      ownerName: this.normalizeText(primaryContact.fullName, userName),
      ownerTitle: this.normalizeText(primaryContact.designation),
      ownerEmail: this.normalizeText(
        primaryContact.directEmail,
        business.businessEmail,
      ),
      profileStatus: this.normalizeText(retailer.profileStatus, 'active'),
      stores,
      suppliers: Array.isArray(retailer.suppliers)
        ? JSON.parse(JSON.stringify(retailer.suppliers))
        : [],
    };
  }

  private buildSupplierProfileSummary(
    supplier: SupplierProfileRecord,
    userName: string,
  ) {
    const business = supplier.business || {};
    const primaryContact = supplier.primaryContact || {};

    return {
      businessName: this.normalizeText(business.companyName),
      businessEmail: this.normalizeText(business.businessEmail),
      businessPhone: this.normalizeText(business.phoneNumber),
      supplierCode: this.normalizeText(business.supplierCode),
      address: this.normalizeText(business.businessAddress),
      website: this.normalizeText(business.website),
      businessType: this.normalizeText(business.businessType),
      currency: this.normalizeText(business.currency),
      primaryCategory: this.normalizeText(business.primaryCategory),
      paymentTerms: this.normalizeText(business.paymentTerms),
      sellingType: this.normalizeText(business.sellingType),
      description: this.normalizeText(business.description),
      state: this.normalizeText(business.state),
      ownerName: this.normalizeText(primaryContact.fullName, userName),
      ownerTitle: this.normalizeText(primaryContact.designation),
      ownerEmail: this.normalizeText(
        primaryContact.directEmail,
        business.businessEmail,
      ),
      profileStatus: this.normalizeText(supplier.profileStatus, 'active'),
      retailers: Array.isArray(supplier.retailers)
        ? JSON.parse(JSON.stringify(supplier.retailers))
        : [],
      productCount: Array.isArray(supplier.products) ? supplier.products.length : 0,
    };
  }

  private readRecordsFromFile<T>(filePath: string) {
    try {
      if (!existsSync(filePath)) {
        return [] as T[];
      }
      const raw = readFileSync(filePath, 'utf-8').trim();
      if (!raw) {
        return [] as T[];
      }
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed : ([] as T[]);
    } catch {
      return [] as T[];
    }
  }

  private hasLinkedProfileChanges(current: User, next: User) {
    return (
      this.normalizeText(current.profileId) !== this.normalizeText(next.profileId) ||
      JSON.stringify(this.normalizeProfile(current.profile)) !==
        JSON.stringify(this.normalizeProfile(next.profile)) ||
      this.normalizeText(current.store) !== this.normalizeText(next.store) ||
      this.normalizeText(current.storeId) !== this.normalizeText(next.storeId) ||
      this.normalizeText(current.currentStoreId) !==
        this.normalizeText(next.currentStoreId) ||
      JSON.stringify(this.normalizeStringList(current.accessibleStoreIds)) !==
        JSON.stringify(this.normalizeStringList(next.accessibleStoreIds))
    );
  }

  private findStoredUser(id: string) {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.normalizeStoredUser(user);
  }

  private readAll() {
    return Array.from(this.users.values()).map((user) =>
      this.normalizeStoredUser(user),
    );
  }

  private writeAll(users: User[]) {
    this.users.clear();
    users.forEach((user) => {
      this.users.set(user.id, this.normalizeStoredUser(user));
    });
    this.persistToDisk();
  }

  private loadFromDisk() {
    mkdirSync(this.dataDirectory, { recursive: true });

    if (!existsSync(this.dataFile)) {
      writeFileSync(
        this.dataFile,
        JSON.stringify(DEFAULT_USERS, null, 2),
        'utf-8',
      );
    }

    try {
      const raw = readFileSync(this.dataFile, 'utf-8').trim();
      const parsed = raw ? (JSON.parse(raw) as User[]) : DEFAULT_USERS;
      const source = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_USERS;
      source.forEach((user) => {
        const normalized = this.normalizeStoredUser(user);
        this.users.set(normalized.id, normalized);
      });
      this.persistToDisk();
    } catch {
      this.users.clear();
      DEFAULT_USERS.forEach((user) => {
        this.users.set(user.id, this.normalizeStoredUser(user));
      });
      this.persistToDisk();
    }
  }

  private persistToDisk() {
    const users = Array.from(this.users.values()).sort((left, right) => {
      return String(right.updatedAt || '').localeCompare(
        String(left.updatedAt || ''),
      );
    });
    writeFileSync(this.dataFile, JSON.stringify(users, null, 2), 'utf-8');
  }

  private normalizeStoredUser(user: Partial<User>): User {
    const now = new Date().toISOString();
    return {
      id: this.normalizeText(user.id, randomUUID()),
      name: this.normalizeText(user.name, 'User'),
      email: this.normalizeEmail(user.email),
      password: this.normalizeText(user.password),
      role: this.normalizeRole(user.role || 'consumer'),
      status: this.normalizeText(user.status, 'Active'),
      store: this.normalizeText(user.store),
      storeId: this.normalizeText(user.storeId),
      currentStoreId: this.normalizeText(user.currentStoreId, user.storeId),
      accessibleStoreIds: this.normalizeStringList(user.accessibleStoreIds),
      profileId: this.normalizeText(user.profileId),
      profile: this.normalizeProfile(user.profile),
      createdAt: this.normalizeText(user.createdAt, now),
      updatedAt: this.normalizeText(user.updatedAt, user.createdAt, now),
    };
  }

  private toPublicUser(user: User): PublicUser {
    const { password: _password, ...publicUser } = this.normalizeStoredUser(user);
    return publicUser;
  }

  private normalizeRole(value: string) {
    const role = this.normalizeText(value, 'consumer').toLowerCase();
    if (role === 'customer') {
      return 'consumer';
    }
    return role;
  }

  private normalizeEmail(value: string) {
    return this.normalizeText(value).toLowerCase();
  }

  private normalizeStringList(values: string[] | undefined) {
    if (!Array.isArray(values)) {
      return [];
    }
    return values
      .map((value) => this.normalizeText(value))
      .filter(Boolean);
  }

  private normalizeProfile(value: Record<string, unknown> | undefined) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  private normalizeText(...values: Array<unknown>) {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }
}
