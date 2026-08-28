import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JsonDbService } from '../common/json-db.service';
import {
  UserRecord,
  RoleRecord,
  StoreRecord,
  SystemSettingsRecord,
} from '../common/database.types';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateStoreDto,
  UpdateStoreDto,
  SystemSettingsDto,
  UserRole,
} from './dto/admin.dto';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly db: JsonDbService,
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
  ) {}

  // ─── User Management (proxied through real UsersService) ───────────────────

  getAllUsers(): UserRecord[] {
    // Delegate to the canonical UsersService which reads from users.json
    const realUsers = this.usersService.findAll() as any[];
    return realUsers.map((u) => ({
      id: String(u.id || ''),
      name: String(u.name || ''),
      email: String(u.email || ''),
      password: '', // never expose password
      role: (u.role || 'consumer') as UserRecord['role'],
      status: (u.status || 'Active') as UserRecord['status'],
      store: u.store,
      retailerId: u.retailerId || u.profileId,
      storeId: u.storeId,
      createdAt: String(u.createdAt || new Date().toISOString()),
      updatedAt: String(u.updatedAt || new Date().toISOString()),
    }));
  }

  getUserById(id: string): UserRecord {
    const user = this.usersService.findOne(id) as any;
    return {
      id: String(user.id || ''),
      name: String(user.name || ''),
      email: String(user.email || ''),
      password: '',
      role: (user.role || 'consumer') as UserRecord['role'],
      status: (user.status || 'Active') as UserRecord['status'],
      store: user.store,
      retailerId: user.retailerId || user.profileId,
      storeId: user.storeId,
      createdAt: String(user.createdAt || new Date().toISOString()),
      updatedAt: String(user.updatedAt || new Date().toISOString()),
    };
  }

  createUser(createUserDto: CreateUserDto): UserRecord {
    const created = this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role as string,
      status: createUserDto.status as string,
      store: createUserDto.store,
      storeId: createUserDto.storeId,
    }) as any;
    return this.getUserById(created.id);
  }

  updateUser(id: string, updateUserDto: UpdateUserDto): UserRecord {
    this.usersService.update(id, {
      name: updateUserDto.name,
      email: updateUserDto.email,
      password: updateUserDto.password,
      role: updateUserDto.role as string,
      status: updateUserDto.status as string,
      store: updateUserDto.store,
      storeId: updateUserDto.storeId,
    });
    return this.getUserById(id);
  }

  deleteUser(id: string) {
    this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  // ─── Role Management ───────────────────────────────────────────────────────

  getAllRoles() {
    const defaultRoles = this.getDefaultRoles();
    const customRoles = this.db.getCollection('roles') as RoleRecord[];
    return [...defaultRoles, ...customRoles];
  }

  getRoleById(id: string) {
    const roles = this.getAllRoles();
    const role = roles.find((r) => r.id === id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  createRole(createRoleDto: CreateRoleDto) {
    const customRoles = this.db.getCollection('roles') as RoleRecord[];
    const allRoles = this.getAllRoles();
    const existingRole = allRoles.find(
      (r) => r.name.toLowerCase() === createRoleDto.name.toLowerCase(),
    );
    if (existingRole) throw new BadRequestException('Role name already exists');

    const newRole: RoleRecord = {
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

  updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const customRoles = this.db.getCollection('roles') as RoleRecord[];
    const index = customRoles.findIndex((r) => r.id === id);
    if (index === -1) throw new NotFoundException('Role not found');

    if (updateRoleDto.name && updateRoleDto.name !== customRoles[index].name) {
      const allRoles = this.getAllRoles();
      const nameExists = allRoles.find(
        (r) => r.name.toLowerCase() === updateRoleDto.name.toLowerCase() && r.id !== id,
      );
      if (nameExists) throw new BadRequestException('Role name already exists');
    }

    customRoles[index] = {
      ...customRoles[index],
      ...updateRoleDto,
      updatedAt: new Date().toISOString(),
    };

    this.db.saveCollection('roles', customRoles);
    return customRoles[index];
  }

  deleteRole(id: string) {
    const customRoles = this.db.getCollection('roles') as RoleRecord[];
    const index = customRoles.findIndex((r) => r.id === id);
    if (index === -1) throw new NotFoundException('Role not found');
    const [deleted] = customRoles.splice(index, 1);
    this.db.saveCollection('roles', customRoles);
    return { message: 'Role deleted successfully', role: deleted };
  }

  // ─── Store Management ──────────────────────────────────────────────────────
  // Admin stores are the union of:
  //  1. Stores created directly via admin (/admin/stores) stored in db.json
  //  2. Stores created by retailers (via retailer setup), merged by StoresService

  getAllStores(): StoreRecord[] {
    // Get all stores across retailer setups (StoresService merges them)
    const retailerStores = this.storesService.findAll() as StoreRecord[];
    // Also include any admin-created stores not already in the retailer set
    const adminStores = this.db.getCollection('stores') as StoreRecord[];
    const merged = new Map<string, StoreRecord>();
    retailerStores.forEach((s) => merged.set(String(s.id), s));
    // Admin-created stores supplement (don't override retailer stores)
    adminStores.forEach((s) => {
      if (!merged.has(String(s.id))) {
        merged.set(String(s.id), s);
      }
    });
    return Array.from(merged.values());
  }

  getStoreById(id: string): StoreRecord {
    const stores = this.getAllStores();
    const store = stores.find((s) => s.id === id);
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  createStore(createStoreDto: CreateStoreDto): StoreRecord {
    const stores = this.db.getCollection('stores') as StoreRecord[];
    const existingStore = stores.find(
      (s) => s.name.toLowerCase() === createStoreDto.name.toLowerCase(),
    );
    if (existingStore) throw new BadRequestException('Store name already exists');

    const newStore: StoreRecord = {
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

  updateStore(id: string, updateStoreDto: UpdateStoreDto): StoreRecord {
    const stores = this.db.getCollection('stores') as StoreRecord[];
    const index = stores.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException('Store not found');

    if (updateStoreDto.name && updateStoreDto.name !== stores[index].name) {
      const nameExists = stores.find(
        (s) => s.name.toLowerCase() === updateStoreDto.name.toLowerCase() && s.id !== id,
      );
      if (nameExists) throw new BadRequestException('Store name already exists');
    }

    stores[index] = {
      ...stores[index],
      ...updateStoreDto,
      updatedAt: new Date().toISOString(),
    };

    this.db.saveCollection('stores', stores);
    return stores[index];
  }

  deleteStore(id: string) {
    const stores = this.db.getCollection('stores') as StoreRecord[];
    const index = stores.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException('Store not found');
    const [deleted] = stores.splice(index, 1);
    this.db.saveCollection('stores', stores);
    return { message: 'Store deleted successfully', store: deleted };
  }

  // ─── System Settings ───────────────────────────────────────────────────────

  getSystemSettings(): SystemSettingsRecord {
    const settings = this.db.getCollection('systemSettings') as SystemSettingsRecord[];
    if (settings.length === 0) return this.getDefaultSettings();
    return settings[0];
  }

  updateSystemSettings(settingsDto: SystemSettingsDto): SystemSettingsRecord {
    const currentSettings = this.getSystemSettings();
    const updatedSettings: SystemSettingsRecord = {
      ...currentSettings,
      ...settingsDto,
      updatedAt: new Date().toISOString(),
    };
    this.db.saveCollection('systemSettings', [updatedSettings]);
    return updatedSettings;
  }

  // ─── Dashboard Statistics ──────────────────────────────────────────────────

  getDashboardStats() {
    // Use real UsersService for user counts
    const allUsers = this.usersService.findAll() as any[];
    const stores = this.getAllStores();
    const products = this.db.getCollection('products');
    const transactions = this.db.getCollection('transactions');

    const retailers = allUsers.filter((u) => String(u.role).toLowerCase() === 'retailer').length;
    const suppliers = allUsers.filter((u) => String(u.role).toLowerCase() === 'supplier').length;
    const consumers = allUsers.filter((u) => String(u.role).toLowerCase() === 'consumer').length;
    const billers = allUsers.filter((u) => String(u.role).toLowerCase() === 'biller').length;

    const lowStockProducts = products.filter((p: any) => {
      const qty = Number(p.qty || 0);
      const min = Number(p.min || 10);
      return qty > 0 && qty <= min;
    }).length;

    const outOfStockProducts = products.filter((p: any) => Number(p.qty || 0) === 0).length;

    const totalRevenue = transactions.reduce((sum: number, t: any) => {
      return sum + Number(t.finalTotal || 0);
    }, 0);

    // Role distribution for chart
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

  // ─── Reports Summary ───────────────────────────────────────────────────────

  getReportsSummary() {
    const products = this.db.getCollection('products') as any[];
    const transactions = this.db.getCollection('transactions') as any[];
    const stores = this.getAllStores();

    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + Number(t.finalTotal || 0), 0);
    const totalOrders = transactions.length;
    const productsSold = products.reduce((sum: number, p: any) => sum + Number(p.soldThisMonth || 0), 0);
    const lowStockItems = products.filter((p: any) => Number(p.qty || 0) > 0 && Number(p.qty || 0) <= Number(p.min || 10)).length;
    const outOfStockItems = products.filter((p: any) => Number(p.qty || 0) === 0).length;
    const inStockItems = products.length - lowStockItems - outOfStockItems;

    // Monthly revenue breakdown from transactions
    const monthlyRevenue: Record<string, number> = {};
    transactions.forEach((t: any) => {
      const month = String(t.timestamp || t.createdAt || '').substring(0, 7); // YYYY-MM
      if (month) {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(t.finalTotal || 0);
      }
    });

    // Top products by soldThisMonth
    const topProducts = [...products]
      .sort((a, b) => Number(b.soldThisMonth || 0) - Number(a.soldThisMonth || 0))
      .slice(0, 10)
      .map((p: any) => ({
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

  // ─── Helper Methods ────────────────────────────────────────────────────────

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultRoles(): RoleRecord[] {
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

  private getDefaultSettings(): SystemSettingsRecord {
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
}