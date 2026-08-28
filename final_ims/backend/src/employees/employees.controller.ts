import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { EmployeeActionDto } from './dto/employee-action.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get(':employeeId/work')
  getWork(@Param('employeeId') employeeId: string) {
    return this.employeesService.getWork(employeeId);
  }

  @Put(':employeeId/retailers/:retailerId/approve')
  approveRetailer(
    @Param('employeeId') employeeId: string,
    @Param('retailerId') retailerId: string,
  ) {
    return this.employeesService.approveRetailer(employeeId, retailerId);
  }

  @Put(':employeeId/retailers/:retailerId/reject')
  rejectRetailer(
    @Param('employeeId') employeeId: string,
    @Param('retailerId') retailerId: string,
    @Body() actionDto: EmployeeActionDto,
  ) {
    return this.employeesService.rejectRetailer(
      employeeId,
      retailerId,
      actionDto,
    );
  }

  @Put(':employeeId/retailers/:retailerId/stores/:storeCode/approve')
  approveRetailerStore(
    @Param('employeeId') employeeId: string,
    @Param('retailerId') retailerId: string,
    @Param('storeCode') storeCode: string,
  ) {
    return this.employeesService.approveRetailerStore(
      employeeId,
      retailerId,
      storeCode,
    );
  }

  @Put(':employeeId/retailers/:retailerId/stores/:storeCode/reject')
  rejectRetailerStore(
    @Param('employeeId') employeeId: string,
    @Param('retailerId') retailerId: string,
    @Param('storeCode') storeCode: string,
    @Body() actionDto: EmployeeActionDto,
  ) {
    return this.employeesService.rejectRetailerStore(
      employeeId,
      retailerId,
      storeCode,
      actionDto,
    );
  }

  @Put(':employeeId/suppliers/:supplierId/approve')
  approveSupplier(
    @Param('employeeId') employeeId: string,
    @Param('supplierId') supplierId: string,
  ) {
    return this.employeesService.approveSupplier(employeeId, supplierId);
  }

  @Put(':employeeId/suppliers/:supplierId/reject')
  rejectSupplier(
    @Param('employeeId') employeeId: string,
    @Param('supplierId') supplierId: string,
    @Body() actionDto: EmployeeActionDto,
  ) {
    return this.employeesService.rejectSupplier(
      employeeId,
      supplierId,
      actionDto,
    );
  }

  @Put(':employeeId/biller-requests/:requestId/approve')
  approveBillerRequest(
    @Param('employeeId') employeeId: string,
    @Param('requestId') requestId: string,
    @Body() actionDto: EmployeeActionDto,
  ) {
    return this.employeesService.approveBillerRequest(
      employeeId,
      requestId,
      actionDto,
    );
  }

  @Put(':employeeId/biller-requests/:requestId/reject')
  rejectBillerRequest(
    @Param('employeeId') employeeId: string,
    @Param('requestId') requestId: string,
    @Body() actionDto: EmployeeActionDto,
  ) {
    return this.employeesService.rejectBillerRequest(
      employeeId,
      requestId,
      actionDto,
    );
  }
}
