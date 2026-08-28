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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../common/json-db.service");
const users_service_1 = require("../users/users.service");
const stores_service_1 = require("../stores/stores.service");
let AdminService = class AdminService {
    constructor(db, usersService, storesService) {
        this.db = db;
        this.usersService = usersService;
        this.storesService = storesService;
    }
    getAllUsers() {
        const realUsers = this.usersService.findAll();
        return realUsers.map((u) => ({
            id: String(u.id || ''),
            name: String(u.name || ''),
            email: String(u.email || ''),
            password: '',
            role: (u.role || 'consumer'),
            status: (u.status || 'Active'),
            store: u.store,
            retailerId: u.retailerId || u.profileId,
            storeId: u.storeId,
            createdAt: String(u.createdAt || new Date().toISOString()),
            updatedAt: String(u.updatedAt || new Date().toISOString()),
        }));
    }
    getUserById(id) {
        const user = this.usersService.findOne(id);
        return {
            id: String(user.id || ''),
            name: String(user.name || ''),
            email: String(user.email || ''),
            password: '',
            role: (user.role || 'consumer'),
            status: (user.status || 'Active'),
            store: user.store,
            retailerId: user.retailerId || user.profileId,
            storeId: user.storeId,
            createdAt: String(user.createdAt || new Date().toISOString()),
            updatedAt: String(user.updatedAt || new Date().toISOString()),
        };
    }
    createUser(createUserDto) {
        const created = this.usersService.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: createUserDto.password,
            role: createUserDto.role,
            status: createUserDto.status,
            store: createUserDto.store,
            storeId: createUserDto.storeId,
        });
        return this.getUserById(created.id);
    }
    updateUser(id, updateUserDto) {
        this.usersService.update(id, {
            name: updateUserDto.name,
            email: updateUserDto.email,
            password: updateUserDto.password,
            role: updateUserDto.role,
            status: updateUserDto.status,
            store: updateUserDto.store,
            storeId: updateUserDto.storeId,
        });
        return this.getUserById(id);
    }
    deleteUser(id) {
        this.usersService.remove(id);
        return { message: 'User deleted successfully' };
    }
    getAllRoles() {
        const defaultRoles = this.getDefaultRoles();
        const customRoles = this.db.getCollection('roles');
        return [...defaultRoles, ...customRoles];
    }
    getRoleById(id) {
        const roles = this.getAllRoles();
        const role = roles.find((r) => r.id === id);
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    createRole(createRoleDto) {
        const customRoles = this.db.getCollection('roles');
        const allRoles = this.getAllRoles();
        const existingRole = allRoles.find((r) => r.name.toLowerCase() === createRoleDto.name.toLowerCase());
        if (existingRole)
            throw new common_1.BadRequestException('Role name already exists');
        const newRole = {
            id: this.generateId(),
            name: createRoleDto.name,
            description: createRoleDto.description,
            permissions: createRoleDto.permissions,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        customRoles.unshift(newRole);
        this.db.saveCollection('roles', customRoles);
        return newRole;
    }
    updateRole(id, updateRoleDto) {
        const customRoles = this.db.getCollection('roles');
        const index = customRoles.findIndex((r) => r.id === id);
        if (index === -1)
            throw new common_1.NotFoundException('Role not found');
        if (updateRoleDto.name && updateRoleDto.name !== customRoles[index].name) {
            const allRoles = this.getAllRoles();
            const nameExists = allRoles.find((r) => r.name.toLowerCase() === updateRoleDto.name.toLowerCase() && r.id !== id);
            if (nameExists)
                throw new common_1.BadRequestException('Role name already exists');
        }
        customRoles[index] = {
            ...customRoles[index],
            ...updateRoleDto,
            updatedAt: new Date().toISOString(),
        };
        this.db.saveCollection('roles', customRoles);
        return customRoles[index];
    }
    deleteRole(id) {
        const customRoles = this.db.getCollection('roles');
        const index = customRoles.findIndex((r) => r.id === id);
        if (index === -1)
            throw new common_1.NotFoundException('Role not found');
        const [deleted] = customRoles.splice(index, 1);
        this.db.saveCollection('roles', customRoles);
        return { message: 'Role deleted successfully', role: deleted };
    }
    getAllStores() {
        const retailerStores = this.storesService.findAll();
        const adminStores = this.db.getCollection('stores');
        const merged = new Map();
        retailerStores.forEach((s) => merged.set(String(s.id), s));
        adminStores.forEach((s) => {
            if (!merged.has(String(s.id))) {
                merged.set(String(s.id), s);
            }
        });
        return Array.from(merged.values());
    }
    getStoreById(id) {
        const stores = this.getAllStores();
        const store = stores.find((s) => s.id === id);
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return store;
    }
    createStore(createStoreDto) {
        const stores = this.db.getCollection('stores');
        const existingStore = stores.find((s) => s.name.toLowerCase() === createStoreDto.name.toLowerCase());
        if (existingStore)
            throw new common_1.BadRequestException('Store name already exists');
        const newStore = {
            id: this.generateId(),
            name: createStoreDto.name,
            location: createStoreDto.location,
            manager: createStoreDto.manager,
            retailerId: createStoreDto.retailerId,
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        stores.unshift(newStore);
        this.db.saveCollection('stores', stores);
        return newStore;
    }
    updateStore(id, updateStoreDto) {
        const stores = this.db.getCollection('stores');
        const index = stores.findIndex((s) => s.id === id);
        if (index === -1)
            throw new common_1.NotFoundException('Store not found');
        if (updateStoreDto.name && updateStoreDto.name !== stores[index].name) {
            const nameExists = stores.find((s) => s.name.toLowerCase() === updateStoreDto.name.toLowerCase() && s.id !== id);
            if (nameExists)
                throw new common_1.BadRequestException('Store name already exists');
        }
        stores[index] = {
            ...stores[index],
            ...updateStoreDto,
            updatedAt: new Date().toISOString(),
        };
        this.db.saveCollection('stores', stores);
        return stores[index];
    }
    deleteStore(id) {
        const stores = this.db.getCollection('stores');
        const index = stores.findIndex((s) => s.id === id);
        if (index === -1)
            throw new common_1.NotFoundException('Store not found');
        const [deleted] = stores.splice(index, 1);
        this.db.saveCollection('stores', stores);
        return { message: 'Store deleted successfully', store: deleted };
    }
    getSystemSettings() {
        const settings = this.db.getCollection('systemSettings');
        if (settings.length === 0)
            return this.getDefaultSettings();
        return settings[0];
    }
    updateSystemSettings(settingsDto) {
        const currentSettings = this.getSystemSettings();
        const updatedSettings = {
            ...currentSettings,
            ...settingsDto,
            updatedAt: new Date().toISOString(),
        };
        this.db.saveCollection('systemSettings', [updatedSettings]);
        return updatedSettings;
    }
    getDashboardStats() {
        const allUsers = this.usersService.findAll();
        const stores = this.getAllStores();
        const products = this.db.getCollection('products');
        const transactions = this.db.getCollection('transactions');
        const retailers = allUsers.filter((u) => String(u.role).toLowerCase() === 'retailer').length;
        const suppliers = allUsers.filter((u) => String(u.role).toLowerCase() === 'supplier').length;
        const consumers = allUsers.filter((u) => String(u.role).toLowerCase() === 'consumer').length;
        const billers = allUsers.filter((u) => String(u.role).toLowerCase() === 'biller').length;
        const lowStockProducts = products.filter((p) => {
            const qty = Number(p.qty || 0);
            const min = Number(p.min || 10);
            return qty > 0 && qty <= min;
        }).length;
        const outOfStockProducts = products.filter((p) => Number(p.qty || 0) === 0).length;
        const totalRevenue = transactions.reduce((sum, t) => {
            return sum + Number(t.finalTotal || 0);
        }, 0);
        const roleDistribution = {
            retailers,
            suppliers,
            consumers,
            billers,
            admins: allUsers.filter((u) => String(u.role).toLowerCase() === 'admin').length,
        };
        return {
            totalRetailers: retailers,
            totalSuppliers: suppliers,
            totalConsumers: consumers,
            totalBillers: billers,
            totalStores: stores.length,
            totalProducts: products.length,
            totalTransactions: transactions.length,
            lowStockAlerts: lowStockProducts,
            outOfStockAlerts: outOfStockProducts,
            totalRevenue,
            roleDistribution,
        };
    }
    getReportsSummary() {
        const products = this.db.getCollection('products');
        const transactions = this.db.getCollection('transactions');
        const stores = this.getAllStores();
        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.finalTotal || 0), 0);
        const totalOrders = transactions.length;
        const productsSold = products.reduce((sum, p) => sum + Number(p.soldThisMonth || 0), 0);
        const lowStockItems = products.filter((p) => Number(p.qty || 0) > 0 && Number(p.qty || 0) <= Number(p.min || 10)).length;
        const outOfStockItems = products.filter((p) => Number(p.qty || 0) === 0).length;
        const inStockItems = products.length - lowStockItems - outOfStockItems;
        const monthlyRevenue = {};
        transactions.forEach((t) => {
            const month = String(t.timestamp || t.createdAt || '').substring(0, 7);
            if (month) {
                monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(t.finalTotal || 0);
            }
        });
        const topProducts = [...products]
            .sort((a, b) => Number(b.soldThisMonth || 0) - Number(a.soldThisMonth || 0))
            .slice(0, 10)
            .map((p) => ({
            name: p.name,
            sku: p.sku,
            store: p.storeId || 'All Stores',
            unitsSold: Number(p.soldThisMonth || 0),
            revenue: Number(p.revenue || (p.soldThisMonth * p.price) || 0),
            emoji: p.emoji || '📦',
        }));
        return {
            totalRevenue,
            totalOrders,
            productsSold,
            lowStockItems,
            outOfStockItems,
            inStockItems,
            totalStores: stores.length,
            monthlyRevenue,
            topProducts,
        };
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    getDefaultRoles() {
        return [
            {
                id: 'role-admin',
                name: 'Admin',
                description: 'Full system access',
                permissions: {
                    viewInventory: true,
                    editInventory: true,
                    manageOrders: true,
                    updateDeliveryStatus: true,
                    viewReports: true,
                    manageUsers: true,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'role-retailer',
                name: 'Retailer',
                description: 'Store management access',
                permissions: {
                    viewInventory: true,
                    editInventory: true,
                    manageOrders: true,
                    updateDeliveryStatus: true,
                    viewReports: true,
                    manageUsers: false,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'role-supplier',
                name: 'Supplier',
                description: 'Supply chain management',
                permissions: {
                    viewInventory: true,
                    editInventory: false,
                    manageOrders: true,
                    updateDeliveryStatus: true,
                    viewReports: true,
                    manageUsers: false,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'role-consumer',
                name: 'Consumer',
                description: 'Customer access',
                permissions: {
                    viewInventory: true,
                    editInventory: false,
                    manageOrders: true,
                    updateDeliveryStatus: false,
                    viewReports: false,
                    manageUsers: false,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'role-biller',
                name: 'Biller',
                description: 'POS and billing access',
                permissions: {
                    viewInventory: true,
                    editInventory: false,
                    manageOrders: true,
                    updateDeliveryStatus: true,
                    viewReports: true,
                    manageUsers: false,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];
    }
    getDefaultSettings() {
        return {
            reorderThreshold: 10,
            lowStockAlertEnabled: true,
            autoReorderEnabled: false,
            maxOrderQuantity: 100,
            currency: 'USD',
            timezone: 'UTC',
            updatedAt: new Date().toISOString(),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        users_service_1.UsersService,
        stores_service_1.StoresService])
], AdminService);
//# sourceMappingURL=admin.service.js.map