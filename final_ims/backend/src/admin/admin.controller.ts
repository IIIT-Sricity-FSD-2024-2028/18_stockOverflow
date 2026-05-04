import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateStoreDto,
  UpdateStoreDto,
  SystemSettingsDto,
} from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Reports Summary
  @Get('reports/summary')
  getReportsSummary() {
    return this.adminService.getReportsSummary();
  }

  // User Management
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Role Management
  @Get('roles')
  getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @Get('roles/:id')
  getRoleById(@Param('id') id: string) {
    return this.adminService.getRoleById(id);
  }

  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminService.createRole(createRoleDto);
  }

  @Put('roles/:id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.adminService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(id);
  }

  // Store Management
  @Get('stores')
  getAllStores() {
    return this.adminService.getAllStores();
  }

  @Get('stores/:id')
  getStoreById(@Param('id') id: string) {
    return this.adminService.getStoreById(id);
  }

  @Post('stores')
  createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.adminService.createStore(createStoreDto);
  }

  @Put('stores/:id')
  updateStore(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.adminService.updateStore(id, updateStoreDto);
  }

  @Delete('stores/:id')
  deleteStore(@Param('id') id: string) {
    return this.adminService.deleteStore(id);
  }

  // System Settings
  @Get('settings')
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Put('settings')
  updateSystemSettings(@Body() settingsDto: SystemSettingsDto) {
    return this.adminService.updateSystemSettings(settingsDto);
  }
}