import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  EmployeeAssignment,
  EmployeeAssignmentStatus,
  EmployeeAssignmentType,
  UserQuery,
} from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { StoresService } from '../stores/stores.service';
import { UsersService } from '../users/users.service';
import { CreateQueryDto } from './dto/create-query.dto';
import { ResolveAssignmentDto } from './dto/resolve-assignment.dto';
import { ResolveQueryDto } from './dto/resolve-query.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly db: JsonDbService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly retailersService: RetailersService,
    private readonly suppliersService: SuppliersService,
    private readonly storesService: StoresService,
  ) {}

  /**
   * Distribute pending items (retailers, suppliers, stores, queries) across all active employees.
   */
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

    // Calculate initial workload for each employee
    const workload = new Map<string, number>();
    employees.forEach((emp) => {
      const activeCount = assignments.filter(
        (a) => a.employeeId === emp.id && a.status === 'pending',
      ).length;
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

    // 1. Pending Retailers
    const retailers = this.retailersService.findAll();
    retailers.forEach((retailer) => {
      const isPending = retailer.profileStatus === 'pending' || !retailer.profileStatus;
      if (isPending) {
        if (!assignedTargetIds.has(retailer.id)) {
          const emp = getNextEmployee();
          const assignment: EmployeeAssignment = {
            id: `asgn-${randomUUID()}`,
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
              submittedAt: retailer.updatedAt || retailer.createdAt || new Date().toISOString(),
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          assignments.unshift(assignment);
          assignedTargetIds.add(retailer.id);
          newAssignmentsCount++;
        } else {
          // Update details for pending assignment if retailer profile was edited/completed
          const existingAsgn = assignments.find((a) => a.targetId === retailer.id && a.status === 'pending');
          if (existingAsgn) {
            existingAsgn.title = `Retailer Verification: ${retailer.business?.businessName || 'New Retailer'}`;
            existingAsgn.details = {
              ...existingAsgn.details,
              businessName: retailer.business?.businessName || existingAsgn.details.businessName,
              ownerName: retailer.primaryContact?.fullName || existingAsgn.details.ownerName,
              email: retailer.business?.businessEmail || retailer.primaryContact?.directEmail || existingAsgn.details.email,
              phone: retailer.business?.phoneNumber || existingAsgn.details.phone,
              address: retailer.business?.businessAddress || existingAsgn.details.address,
              businessType: retailer.business?.businessType || existingAsgn.details.businessType,
              retailerCode: retailer.business?.retailerCode || existingAsgn.details.retailerCode,
              storeCount: (retailer.stores || []).length,
              stores: retailer.stores || [],
              submittedAt: retailer.updatedAt || retailer.createdAt || existingAsgn.details.submittedAt,
            };
          }
        }
      }
    });

    // 2. Pending Suppliers
    const suppliers = this.suppliersService.findAll();
    suppliers.forEach((supplier) => {
      const isPending = supplier.profileStatus === 'pending' || !supplier.profileStatus;
      if (isPending) {
        if (!assignedTargetIds.has(supplier.id)) {
          const emp = getNextEmployee();
          const assignment: EmployeeAssignment = {
            id: `asgn-${randomUUID()}`,
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
              submittedAt: supplier.updatedAt || supplier.createdAt || new Date().toISOString(),
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          assignments.unshift(assignment);
          assignedTargetIds.add(supplier.id);
          newAssignmentsCount++;
        } else {
          // Update details for pending assignment if supplier profile was edited/completed
          const existingAsgn = assignments.find((a) => a.targetId === supplier.id && a.status === 'pending');
          if (existingAsgn) {
            existingAsgn.title = `Supplier Verification: ${supplier.business?.companyName || supplier.business?.businessEmail || 'New Supplier'}`;
            existingAsgn.details = {
              ...existingAsgn.details,
              companyName: supplier.business?.companyName || existingAsgn.details.companyName,
              ownerName: supplier.primaryContact?.fullName || existingAsgn.details.ownerName,
              email: supplier.business?.businessEmail || supplier.primaryContact?.directEmail || existingAsgn.details.email,
              phone: supplier.business?.phoneNumber || existingAsgn.details.phone,
              address: supplier.business?.businessAddress || supplier.business?.state || existingAsgn.details.address,
              category: supplier.business?.primaryCategory || existingAsgn.details.category,
              supplierCode: supplier.business?.supplierCode || existingAsgn.details.supplierCode,
              paymentTerms: supplier.business?.paymentTerms || existingAsgn.details.paymentTerms,
              submittedAt: supplier.updatedAt || supplier.createdAt || existingAsgn.details.submittedAt,
            };
          }
        }
      }
    });

    // 3. Pending Stores (Retailer stores created with pending status)
    retailers.forEach((retailer) => {
      (retailer.stores || []).forEach((store, idx) => {
        const storeKey = `${retailer.id}-store-${store.code || idx}`;
        if (
          store.status === 'pending' &&
          !assignedTargetIds.has(storeKey)
        ) {
          const emp = getNextEmployee();
          const assignment: EmployeeAssignment = {
            id: `asgn-${randomUUID()}`,
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

    // 4. Distribute unassigned User Queries
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

  getAssignments(employeeId?: string, status?: string) {
    this.distributePendingWork();

    let assignments = this.db.getCollection('employeeAssignments') || [];

    if (employeeId) {
      assignments = assignments.filter((a) => a.employeeId === employeeId);
    }

    if (status && status !== 'all') {
      assignments = assignments.filter(
        (a) => a.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return assignments.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  getAssignmentById(id: string) {
    const assignments = this.db.getCollection('employeeAssignments') || [];
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  resolveAssignment(id: string, dto: ResolveAssignmentDto) {
    const assignments = this.db.getCollection('employeeAssignments') || [];
    const index = assignments.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new NotFoundException('Assignment not found');
    }

    const assignment = assignments[index];

    if (dto.employeeId && assignment.employeeId !== dto.employeeId) {
      // Allow admin or assigned employee only
      const user = this.usersService.findOne(dto.employeeId);
      if (user.role !== 'admin' && user.id !== assignment.employeeId) {
        throw new ForbiddenException(
          'This assignment is assigned to another employee',
        );
      }
    }

    const newStatus: EmployeeAssignmentStatus =
      dto.action === 'approve' ? 'approved' : 'rejected';
    assignment.status = newStatus;
    assignment.notes = dto.notes || '';
    assignment.resolvedAt = new Date().toISOString();

    // Propagate status to corresponding entity
    if (assignment.targetType === 'retailer') {
      try {
        const nextStatus = dto.action === 'approve' ? 'active' : 'rejected';
        const reason = dto.action === 'reject' ? (dto.notes || 'Your application did not meet our verification requirements.') : undefined;
        this.retailersService.updateProfileStatus(
          assignment.targetId,
          nextStatus,
          reason,
        );
        const users = this.usersService.findAll('retailer');
        const user = users.find((u) => u.profileId === assignment.targetId || (assignment.details?.email && u.email === assignment.details.email));
        if (user) {
          this.usersService.update(user.id, {
            status: dto.action === 'approve' ? 'Active' : 'Inactive',
          });
        }
      } catch (err) {
        // Entity might not exist or failed
      }
    } else if (assignment.targetType === 'supplier') {
      try {
        const nextStatus = dto.action === 'approve' ? 'active' : 'rejected';
        const supReason = dto.action === 'reject' ? (dto.notes || 'Your application did not meet our verification requirements.') : undefined;
        this.suppliersService.updateProfileStatus(
          assignment.targetId,
          nextStatus,
          supReason,
        );
        const users = this.usersService.findAll('supplier');
        const user = users.find((u) => u.profileId === assignment.targetId || (assignment.details?.email && u.email === assignment.details.email));
        if (user) {
          this.usersService.update(user.id, {
            status: dto.action === 'approve' ? 'Active' : 'Inactive',
          });
        }
      } catch (err) {
        // Suppress
      }
    } else if (assignment.targetType === 'store') {
      try {
        const retailerId = assignment.details.retailerId as string;
        const storeCode = assignment.details.storeCode as string;
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
      } catch (err) {
        // Suppress
      }
    }

    assignments[index] = assignment;
    this.db.saveCollection('employeeAssignments', assignments);

    return {
      message: `Assignment ${dto.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      assignment,
    };
  }

  getQueries(employeeId?: string, status?: string) {
    this.distributePendingWork();

    let queries = this.db.getCollection('userQueries') || [];

    if (employeeId) {
      queries = queries.filter((q) => q.assignedEmployeeId === employeeId);
    }

    if (status && status !== 'all') {
      queries = queries.filter(
        (q) => q.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return queries.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  createQuery(dto: CreateQueryDto) {
    const queries = this.db.getCollection('userQueries') || [];
    const newQuery: UserQuery = {
      id: `qry-${randomUUID()}`,
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

    // Auto-distribute to available employee
    this.distributePendingWork();

    return newQuery;
  }

  resolveQuery(id: string, dto: ResolveQueryDto) {
    const queries = this.db.getCollection('userQueries') || [];
    const index = queries.findIndex((q) => q.id === id);

    if (index === -1) {
      throw new NotFoundException('Query ticket not found');
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

  getStats(employeeId?: string) {
    this.distributePendingWork();

    const assignments = this.db.getCollection('employeeAssignments') || [];
    const queries = this.db.getCollection('userQueries') || [];

    const filteredAssignments = employeeId
      ? assignments.filter((a) => a.employeeId === employeeId)
      : assignments;

    const filteredQueries = employeeId
      ? queries.filter((q) => q.assignedEmployeeId === employeeId)
      : queries;

    const pendingAssignments = filteredAssignments.filter(
      (a) => a.status === 'pending',
    );
    const approvedAssignments = filteredAssignments.filter(
      (a) => a.status === 'approved',
    );
    const rejectedAssignments = filteredAssignments.filter(
      (a) => a.status === 'rejected',
    );

    const pendingQueries = filteredQueries.filter((q) => q.status === 'pending');
    const resolvedQueries = filteredQueries.filter(
      (q) => q.status === 'resolved',
    );

    return {
      totalAssigned: filteredAssignments.length,
      pendingValidations: pendingAssignments.length,
      approvedCount: approvedAssignments.length,
      rejectedCount: rejectedAssignments.length,
      totalQueries: filteredQueries.length,
      pendingQueries: pendingQueries.length,
      resolvedQueries: resolvedQueries.length,
      retailerValidations: filteredAssignments.filter(
        (a) => a.targetType === 'retailer',
      ).length,
      supplierValidations: filteredAssignments.filter(
        (a) => a.targetType === 'supplier',
      ).length,
      storeValidations: filteredAssignments.filter(
        (a) => a.targetType === 'store',
      ).length,
    };
  }
}
