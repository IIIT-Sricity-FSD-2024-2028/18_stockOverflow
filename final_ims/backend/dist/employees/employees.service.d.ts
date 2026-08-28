import { BillersService } from '../billers/billers.service';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { UsersService } from '../users/users.service';
import { EmployeeActionDto } from './dto/employee-action.dto';
export declare class EmployeesService {
    private readonly usersService;
    private readonly retailersService;
    private readonly suppliersService;
    private readonly billersService;
    constructor(usersService: UsersService, retailersService: RetailersService, suppliersService: SuppliersService, billersService: BillersService);
    getWork(employeeId: string): {
        employee: {
            id: string;
            name: string;
            email: string;
            role: string;
            status: string;
            store?: string;
            storeId?: string;
            currentStoreId?: string;
            accessibleStoreIds?: string[];
            profileId?: string;
            profile?: Record<string, unknown>;
            createdAt?: string;
            updatedAt?: string;
        };
        stats: {
            retailerRegistrations: number;
            retailerStores: number;
            suppliers: number;
            billerRequests: number;
            pending: number;
        };
        retailerRegistrations: any[];
        retailerStores: any[];
        suppliers: any[];
        billerRequests: any[];
    };
    approveRetailer(employeeId: string, retailerId: string): {
        status: string;
    };
    rejectRetailer(employeeId: string, retailerId: string, actionDto?: EmployeeActionDto): {
        status: string;
    };
    approveRetailerStore(employeeId: string, retailerId: string, storeCode: string): {
        status: string;
    };
    rejectRetailerStore(employeeId: string, retailerId: string, storeCode: string, actionDto?: EmployeeActionDto): {
        status: string;
    };
    approveSupplier(employeeId: string, supplierId: string): {
        status: string;
    };
    rejectSupplier(employeeId: string, supplierId: string, actionDto?: EmployeeActionDto): {
        status: string;
    };
    approveBillerRequest(employeeId: string, requestId: string, actionDto?: EmployeeActionDto): {
        status: string;
    };
    rejectBillerRequest(employeeId: string, requestId: string, actionDto?: EmployeeActionDto): {
        status: string;
    };
    private requireEmployee;
}
