import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateQueryDto } from './dto/create-query.dto';
import { ResolveAssignmentDto } from './dto/resolve-assignment.dto';
import { ResolveQueryDto } from './dto/resolve-query.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('assignments/distribute')
  distributeWork() {
    return this.employeesService.distributePendingWork();
  }

  @Get('assignments')
  getAssignments(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeesService.getAssignments(employeeId, status);
  }

  @Get('assignments/:id')
  getAssignmentById(@Param('id') id: string) {
    return this.employeesService.getAssignmentById(id);
  }

  @Patch('assignments/:id')
  resolveAssignment(
    @Param('id') id: string,
    @Body() dto: ResolveAssignmentDto,
  ) {
    return this.employeesService.resolveAssignment(id, dto);
  }

  @Get('queries')
  getQueries(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeesService.getQueries(employeeId, status);
  }

  @Post('queries')
  createQuery(@Body() dto: CreateQueryDto) {
    return this.employeesService.createQuery(dto);
  }

  @Patch('queries/:id')
  resolveQuery(@Param('id') id: string, @Body() dto: ResolveQueryDto) {
    return this.employeesService.resolveQuery(id, dto);
  }

  @Get('stats')
  getStats(@Query('employeeId') employeeId?: string) {
    return this.employeesService.getStats(employeeId);
  }
}
