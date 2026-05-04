"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const DEFAULT_USERS = [
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
let UsersService = class UsersService {
    constructor() {
        this.users = new Map();
        this.dataDirectory = (0, node_path_1.join)(__dirname, '..', '..', 'data');
        this.dataFile = (0, node_path_1.join)(this.dataDirectory, 'users.json');
        this.retailersFile = (0, node_path_1.join)(this.dataDirectory, 'retailers.json');
        this.suppliersFile = (0, node_path_1.join)(this.dataDirectory, 'suppliers.json');
        this.billersFile = (0, node_path_1.join)(this.dataDirectory, 'billers.json');
        this.dbFile = (0, node_path_1.join)(this.dataDirectory, 'db.json');
        this.loadFromDisk();
    }
    findAll(role, email) {
        const normalizedRoleRaw = this.normalizeText(role).toLowerCase();
        const normalizedRole = normalizedRoleRaw === 'customer' ? 'consumer' : normalizedRoleRaw;
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
            return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''));
        })
            .map((user) => this.toPublicUser(this.hydrateLinkedProfile(user)));
    }
    findOne(id) {
        return this.toPublicUser(this.syncLinkedProfileForUserId(id));
    }
    create(createUserDto) {
        const users = this.readAll();
        const email = this.normalizeEmail(createUserDto.email);
        const role = this.normalizeRole(createUserDto.role);
        if (users.some((entry) => this.normalizeEmail(entry.email) === email)) {
            throw new common_1.ConflictException('Email already exists');
        }
        const now = new Date().toISOString();
        const created = {
            id: (0, node_crypto_1.randomUUID)(),
            name: this.normalizeText(createUserDto.name, 'User'),
            email,
            password: this.normalizeText(createUserDto.password),
            role,
            status: this.normalizeText(createUserDto.status, 'Active'),
            store: this.normalizeText(createUserDto.store),
            storeId: this.normalizeText(createUserDto.storeId),
            currentStoreId: this.normalizeText(createUserDto.currentStoreId, createUserDto.storeId),
            accessibleStoreIds: this.normalizeStringList(createUserDto.accessibleStoreIds),
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
    update(id, updateUserDto) {
        const users = this.readAll();
        const index = users.findIndex((user) => user.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('User not found');
        }
        const existing = users[index];
        const nextEmail = this.normalizeEmail(updateUserDto.email || existing.email);
        if (users.some((entry) => entry.id !== id && this.normalizeEmail(entry.email) === nextEmail)) {
            throw new common_1.ConflictException('Email already exists');
        }
        const updated = {
            ...existing,
            ...updateUserDto,
            name: this.normalizeText(updateUserDto.name, existing.name),
            email: nextEmail,
            password: this.normalizeText(updateUserDto.password, existing.password),
            role: this.normalizeRole(updateUserDto.role || existing.role),
            status: this.normalizeText(updateUserDto.status, existing.status || 'Active'),
            store: this.normalizeText(updateUserDto.store, existing.store),
            storeId: this.normalizeText(updateUserDto.storeId, existing.storeId),
            currentStoreId: this.normalizeText(updateUserDto.currentStoreId, existing.currentStoreId, updateUserDto.storeId, existing.storeId),
            accessibleStoreIds: updateUserDto.accessibleStoreIds != null
                ? this.normalizeStringList(updateUserDto.accessibleStoreIds)
                : this.normalizeStringList(existing.accessibleStoreIds),
            profileId: this.normalizeText(updateUserDto.profileId, existing.profileId),
            profile: updateUserDto.profile !== undefined
                ? this.normalizeProfile(updateUserDto.profile)
                : this.normalizeProfile(existing.profile),
            updatedAt: new Date().toISOString(),
        };
        const hydrated = this.hydrateLinkedProfile(updated);
        users[index] = hydrated;
        this.writeAll(users);
        return this.toPublicUser(hydrated);
    }
    updateProfile(id, profile) {
        return this.update(id, { profile });
    }
    remove(id) {
        const users = this.readAll();
        const index = users.findIndex((user) => user.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('User not found');
        }
        users.splice(index, 1);
        this.writeAll(users);
        return true;
    }
    login(email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const user = this.readAll().find((entry) => {
            return (this.normalizeEmail(entry.email) === normalizedEmail &&
                entry.password === password);
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (this.normalizeText(user.status, 'Active') !== 'Active') {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        return this.toPublicUser(this.syncLinkedProfileForUserId(user.id));
    }
    syncLinkedProfileForUserId(id) {
        const users = this.readAll();
        const index = users.findIndex((user) => user.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('User not found');
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
    hydrateLinkedProfile(user) {
        const normalized = this.normalizeStoredUser(user);
        if (normalized.role === 'retailer') {
            return this.hydrateRetailerProfile(normalized);
        }
        if (normalized.role === 'supplier') {
            return this.hydrateSupplierProfile(normalized);
        }
        if (normalized.role === 'biller') {
            return this.hydrateBillerProfile(normalized);
        }
        return normalized;
    }
    hydrateRetailerProfile(user) {
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
        const currentStoreId = this.normalizeText(user.currentStoreId, user.storeId, accessibleStoreIds[0]);
        const resolvedStoreId = accessibleStoreIds.includes(currentStoreId)
            ? currentStoreId
            : accessibleStoreIds[0] || '';
        const currentStore = stores.find((store) => store.code === resolvedStoreId) || null;
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
    hydrateSupplierProfile(user) {
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
    hydrateBillerProfile(user) {
        const biller = this.findBillerProfile(user);
        if (!biller) {
            return this.normalizeStoredUser({
                ...user,
                profileId: '',
                profile: undefined,
                storeId: '',
                currentStoreId: '',
                accessibleStoreIds: [],
            });
        }
        const storeId = this.normalizeText(biller.storeId);
        return this.normalizeStoredUser({
            ...user,
            profileId: String(biller.id),
            profile: {
                name: this.normalizeText(biller.name),
                email: this.normalizeText(biller.email),
                retailerId: this.normalizeText(biller.retailerId),
            },
            storeId: storeId,
            currentStoreId: storeId,
            accessibleStoreIds: storeId ? [storeId] : [],
        });
    }
    findRetailerProfile(user) {
        const retailers = this.readRecordsFromFile(this.retailersFile);
        const lookupId = this.normalizeText(user.profileId);
        const lookupEmail = this.normalizeEmail(user.email);
        return (retailers.find((retailer) => retailer.id === lookupId) ||
            retailers.find((retailer) => {
                return (this.normalizeEmail(retailer.business?.businessEmail) === lookupEmail ||
                    this.normalizeEmail(retailer.primaryContact?.directEmail) === lookupEmail);
            }) ||
            null);
    }
    findSupplierProfile(user) {
        const suppliers = this.readRecordsFromFile(this.suppliersFile);
        const lookupId = this.normalizeText(user.profileId);
        const lookupEmail = this.normalizeEmail(user.email);
        return (suppliers.find((supplier) => supplier.id === lookupId) ||
            suppliers.find((supplier) => {
                return (this.normalizeEmail(supplier.business?.businessEmail) === lookupEmail ||
                    this.normalizeEmail(supplier.primaryContact?.directEmail) === lookupEmail);
            }) ||
            null);
    }
    findBillerProfile(user) {
        const billers = [
            ...this.readRecordsFromFile(this.billersFile),
            ...this.readCollectionFromDbFile('billers'),
        ];
        const lookupId = this.normalizeText(user.profileId);
        const lookupEmail = this.normalizeEmail(user.email);
        return (billers.find((biller) => String(biller.id) === lookupId) ||
            billers.find((biller) => this.normalizeEmail(biller.email) === lookupEmail) ||
            null);
    }
    normalizeRetailerStores(retailer) {
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
    buildRetailerProfileSummary(retailer, userName) {
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
            ownerEmail: this.normalizeText(primaryContact.directEmail, business.businessEmail),
            profileStatus: this.normalizeText(retailer.profileStatus, 'active'),
            stores,
            suppliers: Array.isArray(retailer.suppliers)
                ? JSON.parse(JSON.stringify(retailer.suppliers))
                : [],
        };
    }
    buildSupplierProfileSummary(supplier, userName) {
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
            ownerEmail: this.normalizeText(primaryContact.directEmail, business.businessEmail),
            profileStatus: this.normalizeText(supplier.profileStatus, 'active'),
            retailers: Array.isArray(supplier.retailers)
                ? JSON.parse(JSON.stringify(supplier.retailers))
                : [],
            productCount: Array.isArray(supplier.products) ? supplier.products.length : 0,
        };
    }
    readRecordsFromFile(filePath) {
        try {
            if (!(0, node_fs_1.existsSync)(filePath)) {
                return [];
            }
            const raw = (0, node_fs_1.readFileSync)(filePath, 'utf-8').trim();
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    readCollectionFromDbFile(collectionKey) {
        try {
            if (!(0, node_fs_1.existsSync)(this.dbFile)) {
                return [];
            }
            const raw = (0, node_fs_1.readFileSync)(this.dbFile, 'utf-8').trim();
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            const collection = parsed[collectionKey];
            return Array.isArray(collection) ? collection : [];
        }
        catch {
            return [];
        }
    }
    hasLinkedProfileChanges(current, next) {
        return (this.normalizeText(current.profileId) !== this.normalizeText(next.profileId) ||
            JSON.stringify(this.normalizeProfile(current.profile)) !==
                JSON.stringify(this.normalizeProfile(next.profile)) ||
            this.normalizeText(current.store) !== this.normalizeText(next.store) ||
            this.normalizeText(current.storeId) !== this.normalizeText(next.storeId) ||
            this.normalizeText(current.currentStoreId) !==
                this.normalizeText(next.currentStoreId) ||
            JSON.stringify(this.normalizeStringList(current.accessibleStoreIds)) !==
                JSON.stringify(this.normalizeStringList(next.accessibleStoreIds)));
    }
    findStoredUser(id) {
        const user = this.users.get(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.normalizeStoredUser(user);
    }
    readAll() {
        return Array.from(this.users.values()).map((user) => this.normalizeStoredUser(user));
    }
    writeAll(users) {
        this.users.clear();
        users.forEach((user) => {
            this.users.set(user.id, this.normalizeStoredUser(user));
        });
        this.persistToDisk();
    }
    loadFromDisk() {
        (0, node_fs_1.mkdirSync)(this.dataDirectory, { recursive: true });
        if (!(0, node_fs_1.existsSync)(this.dataFile)) {
            (0, node_fs_1.writeFileSync)(this.dataFile, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
        }
        try {
            const raw = (0, node_fs_1.readFileSync)(this.dataFile, 'utf-8').trim();
            const parsed = raw ? JSON.parse(raw) : DEFAULT_USERS;
            const source = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_USERS;
            source.forEach((user) => {
                const normalized = this.normalizeStoredUser(user);
                this.users.set(normalized.id, normalized);
            });
            this.persistToDisk();
        }
        catch {
            this.users.clear();
            DEFAULT_USERS.forEach((user) => {
                this.users.set(user.id, this.normalizeStoredUser(user));
            });
            this.persistToDisk();
        }
    }
    persistToDisk() {
        const users = Array.from(this.users.values()).sort((left, right) => {
            return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''));
        });
        (0, node_fs_1.writeFileSync)(this.dataFile, JSON.stringify(users, null, 2), 'utf-8');
    }
    normalizeStoredUser(user) {
        const now = new Date().toISOString();
        return {
            id: this.normalizeText(user.id, (0, node_crypto_1.randomUUID)()),
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
    toPublicUser(user) {
        const { password: _password, ...publicUser } = this.normalizeStoredUser(user);
        return publicUser;
    }
    normalizeRole(value) {
        const role = this.normalizeText(value, 'consumer').toLowerCase();
        if (role === 'customer') {
            return 'consumer';
        }
        return role;
    }
    normalizeEmail(value) {
        return this.normalizeText(value).toLowerCase();
    }
    normalizeStringList(values) {
        if (!Array.isArray(values)) {
            return [];
        }
        return values
            .map((value) => this.normalizeText(value))
            .filter(Boolean);
    }
    normalizeProfile(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(value));
    }
    normalizeText(...values) {
        for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return '';
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UsersService);
//# sourceMappingURL=users.service.js.map