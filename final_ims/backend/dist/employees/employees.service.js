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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const json_db_service_1 = require("../common/json-db.service");
const retailers_service_1 = require("../retailers/retailers.service");
const suppliers_service_1 = require("../suppliers/suppliers.service");
const stores_service_1 = require("../stores/stores.service");
const users_service_1 = require("../users/users.service");
let EmployeesService = class EmployeesService {
    constructor(db, usersService, retailersService, suppliersService, storesService) {
        this.db = db;
        this.usersService = usersService;
        this.retailersService = retailersService;
        this.suppliersService = suppliersService;
        this.storesService = storesService;
    }
    distributePendingWork() {
        const employees = this.usersService
            .findAll('employee')
            .filter((u) => u.status === 'Active');
        if (employees.length === 0) {
            return {
                message: 'No active employees found to assign work to',
                assignedCount: 0,
            };
        }
        const assignments = this.db.getCollection('employeeAssignments') || [];
        const assignedTargetIds = new Set(assignments.map((a) => a.targetId));
        const workload = new Map();
        employees.forEach((emp) => {
            const activeCount = assignments.filter((a) => a.employeeId === emp.id && a.status === 'pending').length;
            workload.set(emp.id, activeCount);
        });
        const getNextEmployee = () => {
            let minCount = Infinity;
            let selectedEmp = employees[0];
            for (const emp of employees) {
                const count = workload.get(emp.id) ?? 0;
                if (count < minCount) {
                    minCount = count;
                    selectedEmp = emp;
                }
            }
            workload.set(selectedEmp.id, (workload.get(selectedEmp.id) ?? 0) + 1);
            return selectedEmp;
        };
        let newAssignmentsCount = 0;
        const retailers = this.retailersService.findAll();
        retailers.forEach((retailer) => {
            if ((retailer.profileStatus === 'pending' || !retailer.profileStatus) &&
                !assignedTargetIds.has(retailer.id)) {
                const emp = getNextEmployee();
                const assignment = {
                    id: `asgn-${(0, node_crypto_1.randomUUID)()}`,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    employeeEmail: emp.email,
                    targetId: retailer.id,
                    targetType: 'retailer',
                    title: `Retailer Verification: ${retailer.business?.businessName || 'New Retailer'}`,
                    details: {
                        businessName: retailer.business?.businessName || 'Unnamed Business',
                        ownerName: retailer.primaryContact?.fullName || 'Unknown',
                        email: retailer.business?.businessEmail || retailer.primaryContact?.directEmail || '',
                        phone: retailer.business?.phoneNumber || '',
                        address: retailer.business?.businessAddress || '',
                        businessType: retailer.business?.businessType || 'Retailer',
                        retailerCode: retailer.business?.retailerCode || '',
                        storeCount: (retailer.stores || []).length,
                        stores: retailer.stores || [],
                        submittedAt: retailer.createdAt || new Date().toISOString(),
                    },
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                };
                assignments.unshift(assignment);
                assignedTargetIds.add(retailer.id);
                newAssignmentsCount++;
            }
        });
        const suppliers = this.suppliersService.findAll();
        suppliers.forEach((supplier) => {
            if ((supplier.profileStatus === 'pending' || !supplier.profileStatus) &&
                !assignedTargetIds.has(supplier.id)) {
                const emp = getNextEmployee();
                const assignment = {
                    id: `asgn-${(0, node_crypto_1.randomUUID)()}`,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    employeeEmail: emp.email,
                    targetId: supplier.id,
                    targetType: 'supplier',
                    title: `Supplier Verification: ${supplier.business?.companyName || supplier.business?.businessEmail || 'New Supplier'}`,
                    details: {
                        companyName: supplier.business?.companyName || 'Unnamed Supplier',
                        ownerName: supplier.primaryContact?.fullName || 'Unknown',
                        email: supplier.business?.businessEmail || supplier.primaryContact?.directEmail || '',
                        phone: supplier.business?.phoneNumber || '',
                        address: supplier.business?.businessAddress || supplier.business?.state || '',
                        category: supplier.business?.primaryCategory || 'General',
                        supplierCode: supplier.business?.supplierCode || '',
                        paymentTerms: supplier.business?.paymentTerms || 'Net 30',
                        submittedAt: supplier.createdAt || new Date().toISOString(),
                    },
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                };
                assignments.unshift(assignment);
                assignedTargetIds.add(supplier.id);
                newAssignmentsCount++;
            }
        });
        retailers.forEach((retailer) => {
            (retailer.stores || []).forEach((store, idx) => {
                const storeKey = `${retailer.id}-store-${store.code || idx}`;
                if (store.status === 'pending' &&
                    !assignedTargetIds.has(storeKey)) {
                    const emp = getNextEmployee();
                    const assignment = {
                        id: `asgn-${(0, node_crypto_1.randomUUID)()}`,
                        employeeId: emp.id,
                        employeeName: emp.name,
                        employeeEmail: emp.email,
                        targetId: storeKey,
                        targetType: 'store',
                        title: `Store Validation: ${store.name} (${retailer.business?.businessName})`,
                        details: {
                            retailerId: retailer.id,
                            retailerName: retailer.business?.businessName,
                            storeName: store.name,
                            storeCode: store.code,
                            address: store.address,
                            contactPerson: store.contactPerson,
                            phone: store.phone,
                            type: store.type,
                            submittedAt: retailer.updatedAt || new Date().toISOString(),
                        },
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                    };
                    assignments.unshift(assignment);
                    assignedTargetIds.add(storeKey);
                    newAssignmentsCount++;
                }
            });
        });
        this.db.saveCollection('employeeAssignments', assignments);
        const queries = this.db.getCollection('userQueries') || [];
        let updatedQueries = false;
        queries.forEach((q) => {
            if (q.status === 'pending' && !q.assignedEmployeeId) {
                const emp = getNextEmployee();
                q.assignedEmployeeId = emp.id;
                q.assignedEmployeeName = emp.name;
                updatedQueries = true;
            }
        });
        if (updatedQueries) {
            this.db.saveCollection('userQueries', queries);
        }
        return {
            message: 'Work distribution completed',
            assignedCount: newAssignmentsCount,
            totalAssignments: assignments.length,
        };
    }
    getAssignments(employeeId, status) {
        this.distributePendingWork();
        let assignments = this.db.getCollection('employeeAssignments') || [];
        if (employeeId) {
            assignments = assignments.filter((a) => a.employeeId === employeeId);
        }
        if (status && status !== 'all') {
            assignments = assignments.filter((a) => a.status.toLowerCase() === status.toLowerCase());
        }
        return assignments.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    getAssignmentById(id) {
        const assignments = this.db.getCollection('employeeAssignments') || [];
        const assignment = assignments.find((a) => a.id === id);
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        return assignment;
    }
    resolveAssignment(id, dto) {
        const assignments = this.db.getCollection('employeeAssignments') || [];
        const index = assignments.findIndex((a) => a.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        const assignment = assignments[index];
        if (dto.employeeId && assignment.employeeId !== dto.employeeId) {
            const user = this.usersService.findOne(dto.employeeId);
            if (user.role !== 'admin' && user.id !== assignment.employeeId) {
                throw new common_1.ForbiddenException('This assignment is assigned to another employee');
            }
        }
        const newStatus = dto.action === 'approve' ? 'approved' : 'rejected';
        assignment.status = newStatus;
        assignment.notes = dto.notes || '';
        assignment.resolvedAt = new Date().toISOString();
        if (assignment.targetType === 'retailer') {
            try {
                this.retailersService.updateProfileStatus(assignment.targetId, dto.action === 'approve' ? 'active' : 'rejected');
            }
            catch (err) {
            }
        }
        else if (assignment.targetType === 'supplier') {
            try {
                this.suppliersService.updateProfileStatus(assignment.targetId, dto.action === 'approve' ? 'active' : 'rejected');
            }
            catch (err) {
            }
        }
        else if (assignment.targetType === 'store') {
            try {
                const retailerId = assignment.details.retailerId;
                const storeCode = assignment.details.storeCode;
                if (retailerId) {
                    const retailer = this.retailersService.findOne(retailerId);
                    if (retailer && retailer.stores) {
                        const store = retailer.stores.find((s) => s.code === storeCode);
                        if (store) {
                            store.status = dto.action === 'approve' ? 'active' : 'rejected';
                            this.retailersService.update(retailerId, { stores: retailer.stores });
                        }
                    }
                }
            }
            catch (err) {
            }
        }
        assignments[index] = assignment;
        this.db.saveCollection('employeeAssignments', assignments);
        return {
            message: `Assignment ${dto.action === 'approve' ? 'approved' : 'rejected'} successfully`,
            assignment,
        };
    }
    getQueries(employeeId, status) {
        this.distributePendingWork();
        let queries = this.db.getCollection('userQueries') || [];
        if (employeeId) {
            queries = queries.filter((q) => q.assignedEmployeeId === employeeId);
        }
        if (status && status !== 'all') {
            queries = queries.filter((q) => q.status.toLowerCase() === status.toLowerCase());
        }
        return queries.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    createQuery(dto) {
        const queries = this.db.getCollection('userQueries') || [];
        const newQuery = {
            id: `qry-${(0, node_crypto_1.randomUUID)()}`,
            userId: dto.userId || '',
            userName: dto.userName,
            userEmail: dto.userEmail,
            userRole: dto.userRole || 'customer',
            subject: dto.subject,
            message: dto.message,
            status: 'pending',
            priority: dto.priority || 'medium',
            createdAt: new Date().toISOString(),
        };
        queries.unshift(newQuery);
        this.db.saveCollection('userQueries', queries);
        this.distributePendingWork();
        return newQuery;
    }
    resolveQuery(id, dto) {
        const queries = this.db.getCollection('userQueries') || [];
        const index = queries.findIndex((q) => q.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Query ticket not found');
        }
        const query = queries[index];
        query.response = dto.response;
        query.status = dto.status || 'resolved';
        query.resolvedAt = new Date().toISOString();
        queries[index] = query;
        this.db.saveCollection('userQueries', queries);
        return {
            message: 'Query resolved successfully',
            query,
        };
    }
    getStats(employeeId) {
        this.distributePendingWork();
        const assignments = this.db.getCollection('employeeAssignments') || [];
        const queries = this.db.getCollection('userQueries') || [];
        const filteredAssignments = employeeId
            ? assignments.filter((a) => a.employeeId === employeeId)
            : assignments;
        const filteredQueries = employeeId
            ? queries.filter((q) => q.assignedEmployeeId === employeeId)
            : queries;
        const pendingAssignments = filteredAssignments.filter((a) => a.status === 'pending');
        const approvedAssignments = filteredAssignments.filter((a) => a.status === 'approved');
        const rejectedAssignments = filteredAssignments.filter((a) => a.status === 'rejected');
        const pendingQueries = filteredQueries.filter((q) => q.status === 'pending');
        const resolvedQueries = filteredQueries.filter((q) => q.status === 'resolved');
        return {
            totalAssigned: filteredAssignments.length,
            pendingValidations: pendingAssignments.length,
            approvedCount: approvedAssignments.length,
            rejectedCount: rejectedAssignments.length,
            totalQueries: filteredQueries.length,
            pendingQueries: pendingQueries.length,
            resolvedQueries: resolvedQueries.length,
            retailerValidations: filteredAssignments.filter((a) => a.targetType === 'retailer').length,
            supplierValidations: filteredAssignments.filter((a) => a.targetType === 'supplier').length,
            storeValidations: filteredAssignments.filter((a) => a.targetType === 'store').length,
        };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        users_service_1.UsersService,
        retailers_service_1.RetailersService,
        suppliers_service_1.SuppliersService,
        stores_service_1.StoresService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map