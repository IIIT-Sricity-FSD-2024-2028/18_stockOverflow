import { Injectable, NotFoundException } from '@nestjs/common';
import { BillersService } from '../billers/billers.service';
import { RetailersService } from '../retailers/retailers.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { UsersService } from '../users/users.service';
import { EmployeeActionDto } from './dto/employee-action.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly retailersService: RetailersService,
    private readonly suppliersService: SuppliersService,
    private readonly billersService: BillersService,
  ) {}

  getWork(employeeId: string) {
    const employee = this.requireEmployee(employeeId);
    const retailerRegistrations =
      this.retailersService.findAssignedValidations(employeeId);
    const retailerStores =
      this.retailersService.findAssignedStoreValidations(employeeId);
    const suppliers = this.suppliersService.findAssignedValidations(employeeId);
    const billerRequests = this.billersService.getRequests(employeeId);

    return {
      employee,
      stats: {
        retailerRegistrations: retailerRegistrations.length,
        retailerStores: retailerStores.length,
        suppliers: suppliers.length,
        billerRequests: billerRequests.length,
        pending:
          retailerRegistrations.filter(
            (item) => item.validationStatus === 'pending',
          ).length +
          retailerStores.filter((item) => item.validationStatus === 'pending')
            .length +
          suppliers.filter((item) => item.validationStatus === 'pending').length +
          billerRequests.filter((item) => item.status === 'pending').length,
      },
      retailerRegistrations,
      retailerStores,
      suppliers,
      billerRequests,
    };
  }

  approveRetailer(employeeId: string, retailerId: string) {
    this.requireEmployee(employeeId);
    return this.retailersService.approveValidation(retailerId, employeeId);
  }

  rejectRetailer(
    employeeId: string,
    retailerId: string,
    actionDto: EmployeeActionDto = {},
  ) {
    this.requireEmployee(employeeId);
    return this.retailersService.rejectValidation(
      retailerId,
      employeeId,
      actionDto.reason,
    );
  }

  approveRetailerStore(
    employeeId: string,
    retailerId: string,
    storeCode: string,
  ) {
    this.requireEmployee(employeeId);
    return this.retailersService.approveStoreValidation(
      retailerId,
      storeCode,
      employeeId,
    );
  }

  rejectRetailerStore(
    employeeId: string,
    retailerId: string,
    storeCode: string,
    actionDto: EmployeeActionDto = {},
  ) {
    this.requireEmployee(employeeId);
    return this.retailersService.rejectStoreValidation(
      retailerId,
      storeCode,
      employeeId,
      actionDto.reason,
    );
  }

  approveSupplier(employeeId: string, supplierId: string) {
    this.requireEmployee(employeeId);
    return this.suppliersService.approveValidation(supplierId, employeeId);
  }

  rejectSupplier(
    employeeId: string,
    supplierId: string,
    actionDto: EmployeeActionDto = {},
  ) {
    this.requireEmployee(employeeId);
    return this.suppliersService.rejectValidation(
      supplierId,
      employeeId,
      actionDto.reason,
    );
  }

  approveBillerRequest(
    employeeId: string,
    requestId: string,
    actionDto: EmployeeActionDto = {},
  ) {
    this.requireEmployee(employeeId);
    return this.billersService.approveAssignedRequest(
      requestId,
      employeeId,
      actionDto,
    );
  }

  rejectBillerRequest(
    employeeId: string,
    requestId: string,
    actionDto: EmployeeActionDto = {},
  ) {
    this.requireEmployee(employeeId);
    return this.billersService.rejectAssignedRequest(
      requestId,
      employeeId,
      actionDto.reason,
    );
  }

  private requireEmployee(employeeId: string) {
    const user = this.usersService.findOne(employeeId);
    if (String(user.role || '').toLowerCase() !== 'employee') {
      throw new NotFoundException('Employee not found');
    }
    return user;
  }
}
