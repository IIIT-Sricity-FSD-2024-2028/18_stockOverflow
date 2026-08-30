import { EmployeeAssignment, UserQuery } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { StoresService } from '../stores/stores.service';
import { UsersService } from '../users/users.service';
import { CreateQueryDto } from './dto/create-query.dto';
import { ResolveAssignmentDto } from './dto/resolve-assignment.dto';
import { ResolveQueryDto } from './dto/resolve-query.dto';
export declare class EmployeesService {
    private readonly db;
    private readonly usersService;
    private readonly retailersService;
    private readonly suppliersService;
    private readonly storesService;
    constructor(db: JsonDbService, usersService: UsersService, retailersService: RetailersService, suppliersService: SuppliersService, storesService: StoresService);
    distributePendingWork(): {
        message: string;
        assignedCount: number;
        totalAssignments?: undefined;
    } | {
        message: string;
        assignedCount: number;
        totalAssignments: number;
    };
    getAssignments(employeeId?: string, status?: string): EmployeeAssignment[];
    getAssignmentById(id: string): EmployeeAssignment;
    resolveAssignment(id: string, dto: ResolveAssignmentDto): {
        message: string;
        assignment: EmployeeAssignment;
    };
    getQueries(employeeId?: string, status?: string): UserQuery[];
    createQuery(dto: CreateQueryDto): UserQuery;
    resolveQuery(id: string, dto: ResolveQueryDto): {
        message: string;
        query: UserQuery;
    };
    getStats(employeeId?: string): {
        totalAssigned: number;
        pendingValidations: number;
        approvedCount: number;
        rejectedCount: number;
        totalQueries: number;
        pendingQueries: number;
        resolvedQueries: number;
        retailerValidations: number;
        supplierValidations: number;
        storeValidations: number;
    };
}
