import { AdminService } from './admin.service';
import { CreateUserDto, UpdateUserDto, CreateRoleDto, UpdateRoleDto, CreateStoreDto, UpdateStoreDto, SystemSettingsDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    getAllUsers(): import("../common/database.types").UserRecord[];
    getUserById(id: string): import("../common/database.types").UserRecord;
    createUser(createUserDto: CreateUserDto): import("../common/database.types").UserRecord;
    updateUser(id: string, updateUserDto: UpdateUserDto): import("../common/database.types").UserRecord;
    deleteUser(id: string): {
        message: string;
    };
    getAllRoles(): import("../common/database.types").RoleRecord[];
    getRoleById(id: string): import("../common/database.types").RoleRecord;
    createRole(createRoleDto: CreateRoleDto): import("../common/database.types").RoleRecord;
    updateRole(id: string, updateRoleDto: UpdateRoleDto): import("../common/database.types").RoleRecord;
    deleteRole(id: string): {
        message: string;
        role: import("../common/database.types").RoleRecord;
    };
    getAllStores(): import("../common/database.types").StoreRecord[];
    getStoreById(id: string): import("../common/database.types").StoreRecord;
    createStore(createStoreDto: CreateStoreDto): import("../common/database.types").StoreRecord;
    updateStore(id: string, updateStoreDto: UpdateStoreDto): import("../common/database.types").StoreRecord;
    deleteStore(id: string): {
        message: string;
        store: import("../common/database.types").StoreRecord;
    };
    getSystemSettings(): import("../common/database.types").SystemSettingsRecord;
    updateSystemSettings(settingsDto: SystemSettingsDto): import("../common/database.types").SystemSettingsRecord;
}
