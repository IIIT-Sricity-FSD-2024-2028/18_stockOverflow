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
import { CreateRetailerSetupDto } from './dto/create-retailer-setup.dto';
import { RetailerDirectoryEntry } from './retailer-directory-entry.interface';
import { UpdateRetailerSetupDto } from './dto/update-retailer-setup.dto';
import { RetailerRecord } from './retailer-record.interface';
import { RetailersService } from './retailers.service';

@Controller('retailers')
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  @Post('setup')
  create(@Body() createRetailerSetupDto: CreateRetailerSetupDto): RetailerRecord {
    return this.retailersService.create(createRetailerSetupDto);
  }

  @Get()
  findAll(): RetailerRecord[] {
    return this.retailersService.findAll();
  }

  @Get('directory')
  getDirectory(): RetailerDirectoryEntry[] {
    return this.retailersService.getDirectory();
  }

  @Get('latest')
  findLatest(): RetailerRecord | null {
    return this.retailersService.findLatest();
  }

  @Get('by-email/:email')
  findByBusinessEmail(@Param('email') email: string): RetailerRecord | null {
    return this.retailersService.findByBusinessEmail(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string): RetailerRecord {
    return this.retailersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRetailerSetupDto: UpdateRetailerSetupDto,
  ): RetailerRecord {
    return this.retailersService.update(id, updateRetailerSetupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    return this.retailersService.remove(id);
  }
}
