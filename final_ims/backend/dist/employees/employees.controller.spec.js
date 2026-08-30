"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const employees_controller_1 = require("./employees.controller");
const employees_service_1 = require("./employees.service");
describe('EmployeesController', () => {
    let controller;
    let service;
    const sampleAssignment = {
        id: 'asgn-1',
        employeeId: 'u-employee-1',
        employeeName: 'Alex Morgan',
        employeeEmail: 'employee@stockoverflow.com',
        targetId: 'ret-1',
        targetType: 'retailer',
        title: 'Retailer Verification: Metro Mart',
        details: { businessName: 'Metro Mart' },
        status: 'pending',
        createdAt: '2026-08-28T00:00:00.000Z',
    };
    beforeEach(async () => {
        service = {
            distributePendingWork: jest.fn(),
            getAssignments: jest.fn(),
            getAssignmentById: jest.fn(),
            resolveAssignment: jest.fn(),
            getQueries: jest.fn(),
            createQuery: jest.fn(),
            resolveQuery: jest.fn(),
            getStats: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            controllers: [employees_controller_1.EmployeesController],
            providers: [
                {
                    provide: employees_service_1.EmployeesService,
                    useValue: service,
                },
            ],
        }).compile();
        controller = module.get(employees_controller_1.EmployeesController);
    });
    it('triggers work distribution', () => {
        service.distributePendingWork.mockReturnValue({
            message: 'Work distribution completed',
            assignedCount: 2,
            totalAssignments: 2,
        });
        const result = controller.distributeWork();
        expect(result.assignedCount).toBe(2);
        expect(service.distributePendingWork).toHaveBeenCalled();
    });
    it('fetches assignments filtered by employeeId', () => {
        service.getAssignments.mockReturnValue([sampleAssignment]);
        const result = controller.getAssignments('u-employee-1', 'pending');
        expect(result).toEqual([sampleAssignment]);
        expect(service.getAssignments).toHaveBeenCalledWith('u-employee-1', 'pending');
    });
    it('resolves an assignment with approve action', () => {
        const resolvedAssignment = {
            ...sampleAssignment,
            status: 'approved',
        };
        service.resolveAssignment.mockReturnValue({
            message: 'Assignment approved successfully',
            assignment: resolvedAssignment,
        });
        const result = controller.resolveAssignment('asgn-1', {
            action: 'approve',
            employeeId: 'u-employee-1',
        });
        expect(result.assignment.status).toBe('approved');
        expect(service.resolveAssignment).toHaveBeenCalledWith('asgn-1', {
            action: 'approve',
            employeeId: 'u-employee-1',
        });
    });
    it('returns employee stats', () => {
        const stats = {
            totalAssigned: 5,
            pendingValidations: 2,
            approvedCount: 3,
            rejectedCount: 0,
            totalQueries: 4,
            pendingQueries: 1,
            resolvedQueries: 3,
            retailerValidations: 3,
            supplierValidations: 1,
            storeValidations: 1,
        };
        service.getStats.mockReturnValue(stats);
        const result = controller.getStats('u-employee-1');
        expect(result).toEqual(stats);
        expect(service.getStats).toHaveBeenCalledWith('u-employee-1');
    });
});
//# sourceMappingURL=employees.controller.spec.js.map