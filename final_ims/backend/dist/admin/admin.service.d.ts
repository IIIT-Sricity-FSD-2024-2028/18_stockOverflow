import { JsonDbService } from '../common/json-db.service';
import { UserRecord, RoleRecord, StoreRecord, SystemSettingsRecord } from '../common/database.types';
import { CreateUserDto, UpdateUserDto, CreateRoleDto, UpdateRoleDto, CreateStoreDto, UpdateStoreDto, SystemSettingsDto } from './dto/admin.dto';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
export declare class AdminService {
    private readonly db;
    private readonly usersService;
    private readonly storesService;
    constructor(db: JsonDbService, usersService: UsersService, storesService: StoresService);
    getAllUsers(): UserRecord[];
    getUserById(id: string): UserRecord;
    createUser(createUserDto: CreateUserDto): UserRecord;
    updateUser(id: string, updateUserDto: UpdateUserDto): UserRecord;
    deleteUser(id: string): {
        message: string;
    };
    getAllRoles(): RoleRecord[];
    getRoleById(id: string): RoleRecord;
    createRole(createRoleDto: CreateRoleDto): RoleRecord;
    updateRole(id: string, updateRoleDto: UpdateRoleDto): RoleRecord;
    deleteRole(id: string): {
        message: string;
        role: RoleRecord;
    };
    getAllStores(): StoreRecord[];
    getStoreById(id: string): StoreRecord;
    createStore(createStoreDto: CreateStoreDto): StoreRecord;
    updateStore(id: string, updateStoreDto: UpdateStoreDto): StoreRecord;
    deleteStore(id: string): {
        message: string;
        store: StoreRecord;
    };
    getSystemSettings(): SystemSettingsRecord;
    updateSystemSettings(settingsDto: SystemSettingsDto): SystemSettingsRecord;
    getDashboardStats(): {
        totalRetailers: number;
        totalSuppliers: number;
        totalConsumers: number;
        totalBillers: number;
        totalStores: number;
        totalProducts: number;
        totalTransactions: number;
        lowStockAlerts: number;
        outOfStockAlerts: number;
        totalRevenue: number;
        roleDistribution: {
            retailers: number;
            suppliers: number;
            consumers: number;
            billers: number;
            admins: number;
        };
    };
    getReportsSummary(): {
        totalRevenue: any;
        totalOrders: number;
        productsSold: any;
        lowStockItems: number;
        outOfStockItems: number;
        inStockItems: number;
        totalStores: number;
        monthlyRevenue: Record<string, number>;
        topProducts: {
            name: any;
            sku: any;
            store: any;
            unitsSold: number;
            revenue: number;
            emoji: any;
        }[];
    };
    private generateId;
    private getDefaultRoles;
    private getDefaultSettings;
}
