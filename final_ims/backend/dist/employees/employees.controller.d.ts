import { CreateQueryDto } from './dto/create-query.dto';
import { ResolveAssignmentDto } from './dto/resolve-assignment.dto';
import { ResolveQueryDto } from './dto/resolve-query.dto';
import { EmployeesService } from './employees.service';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    distributeWork(): {
        message: string;
        assignedCount: number;
        totalAssignments?: undefined;
    } | {
        message: string;
        assignedCount: number;
        totalAssignments: number;
    };
    getAssignments(employeeId?: string, status?: string): import("../common/database.types").EmployeeAssignment[];
    getAssignmentById(id: string): import("../common/database.types").EmployeeAssignment;
    resolveAssignment(id: string, dto: ResolveAssignmentDto): {
        message: string;
        assignment: import("../common/database.types").EmployeeAssignment;
    };
    getQueries(employeeId?: string, status?: string): import("../common/database.types").UserQuery[];
    createQuery(dto: CreateQueryDto): import("../common/database.types").UserQuery;
    resolveQuery(id: string, dto: ResolveQueryDto): {
        message: string;
        query: import("../common/database.types").UserQuery;
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
