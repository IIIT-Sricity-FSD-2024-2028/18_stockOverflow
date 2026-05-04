"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDbService = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const seed_data_1 = require("./seed-data");
let JsonDbService = class JsonDbService {
    constructor() {
        this.dbFilePath = (0, node_path_1.resolve)(process.cwd(), 'data', 'db.json');
        this.db = structuredClone(seed_data_1.INITIAL_DB);
    }
    onModuleInit() {
        this.ensureDatabaseFile();
        this.db = this.readFromDisk();
    }
    getCollection(key) {
        return structuredClone(this.db[key]);
    }
    saveCollection(key, value) {
        this.db[key] = structuredClone(value);
        this.persist();
        return structuredClone(this.db[key]);
    }
    updateCollection(key, updater) {
        const nextCollection = updater(this.getCollection(key));
        return this.saveCollection(key, nextCollection);
    }
    getSnapshot() {
        return structuredClone(this.db);
    }
    ensureDatabaseFile() {
        const folderPath = (0, node_path_1.dirname)(this.dbFilePath);
        if (!(0, node_fs_1.existsSync)(folderPath)) {
            (0, node_fs_1.mkdirSync)(folderPath, { recursive: true });
        }
        if (!(0, node_fs_1.existsSync)(this.dbFilePath)) {
            (0, node_fs_1.writeFileSync)(this.dbFilePath, JSON.stringify(seed_data_1.INITIAL_DB, null, 2));
        }
    }
    readFromDisk() {
        try {
            const raw = (0, node_fs_1.readFileSync)(this.dbFilePath, 'utf8');
            const parsed = JSON.parse(raw);
            return {
                products: Array.isArray(parsed.products)
                    ? parsed.products
                    : structuredClone(seed_data_1.INITIAL_DB.products),
                stores: Array.isArray(parsed.stores)
                    ? parsed.stores
                    : structuredClone(seed_data_1.INITIAL_DB.stores),
                customers: Array.isArray(parsed.customers)
                    ? parsed.customers
                    : structuredClone(seed_data_1.INITIAL_DB.customers),
                billers: Array.isArray(parsed.billers)
                    ? parsed.billers
                    : structuredClone(seed_data_1.INITIAL_DB.billers),
                biller_requests: Array.isArray(parsed.biller_requests)
                    ? parsed.biller_requests
                    : structuredClone(seed_data_1.INITIAL_DB.biller_requests),
                suppliers: Array.isArray(parsed.suppliers)
                    ? parsed.suppliers
                    : structuredClone(seed_data_1.INITIAL_DB.suppliers),
                warehouses: Array.isArray(parsed.warehouses)
                    ? parsed.warehouses
                    : structuredClone(seed_data_1.INITIAL_DB.warehouses),
                purchaseOrders: Array.isArray(parsed.purchaseOrders)
                    ? parsed.purchaseOrders
                    : structuredClone(seed_data_1.INITIAL_DB.purchaseOrders),
                reservations: Array.isArray(parsed.reservations)
                    ? parsed.reservations
                    : [],
                reservationRequests: Array.isArray(parsed.reservationRequests)
                    ? parsed.reservationRequests
                    : [],
                transactions: Array.isArray(parsed.transactions)
                    ? parsed.transactions
                    : [],
                returns: Array.isArray(parsed.returns) ? parsed.returns : [],
                stockAdjustments: Array.isArray(parsed.stockAdjustments)
                    ? parsed.stockAdjustments
                    : structuredClone(seed_data_1.INITIAL_DB.stockAdjustments),
                users: Array.isArray(parsed.users)
                    ? parsed.users
                    : structuredClone(seed_data_1.INITIAL_DB.users),
                roles: Array.isArray(parsed.roles)
                    ? parsed.roles
                    : structuredClone(seed_data_1.INITIAL_DB.roles),
                systemSettings: Array.isArray(parsed.systemSettings)
                    ? parsed.systemSettings
                    : structuredClone(seed_data_1.INITIAL_DB.systemSettings),
            };
        }
        catch {
            return structuredClone(seed_data_1.INITIAL_DB);
        }
    }
    persist() {
        (0, node_fs_1.writeFileSync)(this.dbFilePath, JSON.stringify(this.db, null, 2));
    }
};
exports.JsonDbService = JsonDbService;
exports.JsonDbService = JsonDbService = __decorate([
    (0, common_1.Injectable)()
], JsonDbService);
//# sourceMappingURL=json-db.service.js.map