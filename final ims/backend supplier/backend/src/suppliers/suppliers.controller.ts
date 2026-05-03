import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { UpdateSupplierSetupDto } from './dto/update-supplier-setup.dto';
import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord } from './supplier-record.interface';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('setup')
  create(@Body() createSupplierSetupDto: CreateSupplierSetupDto): SupplierRecord {
    return this.suppliersService.create(createSupplierSetupDto);
  }

  @Get()
  findAll(): SupplierRecord[] {
    return this.suppliersService.findAll();
  }

  @Get('directory')
  getDirectory(): SupplierDirectoryEntry[] {
    return this.suppliersService.getDirectory();
  }

  @Get('latest')
  findLatest(): SupplierRecord | null {
    return this.suppliersService.findLatest();
  }

  @Get('by-email/:email')
  findByBusinessEmail(@Param('email') email: string): SupplierRecord | null {
    return this.suppliersService.findByBusinessEmail(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string): SupplierRecord {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplierSetupDto: UpdateSupplierSetupDto,
  ): SupplierRecord {
    return this.suppliersService.update(id, updateSupplierSetupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    return this.suppliersService.remove(id);
  }
}
