import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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

  @Post(':id/stores')
  addStore(
    @Param('id') id: string,
    @Body() storeDto: Record<string, unknown>,
    @Query('userPlan') userPlan?: string,
  ): RetailerRecord {
    const plan = (userPlan || 'free').toLowerCase();
    const retailer = this.retailersService.findOne(id);
    const currentStores = retailer.stores || [];

    // SaaS plan enforcement
    const planLimits: Record<string, number> = {
      free: 1,
      pro: 5,
      enterprise: Infinity,
    };
    const limit = planLimits[plan] ?? 1;
    if (currentStores.length >= limit) {
      const planNames: Record<string, string> = {
        free: 'Starter Kirana (Free)',
        pro: 'Vyapar Pro',
        enterprise: 'Bharat Enterprise',
      };
      throw new BadRequestException(
        `PLAN_LIMIT_REACHED:${plan}:${limit}:${planNames[plan] || 'your current plan'}`,
      );
    }

    // Generate store code from name if not provided
    const name = String(storeDto['name'] || '').trim();
    if (!name) throw new BadRequestException('Store name is required');
    const code = String(storeDto['code'] || '')
      .trim()
      .toUpperCase()
      || name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').substring(0, 16);

    const newStore = {
      name,
      code,
      contactPerson: String(storeDto['contactPerson'] || '').trim(),
      phone: String(storeDto['phone'] || '').trim(),
      address: String(storeDto['address'] || '').trim(),
      type: String(storeDto['type'] || 'Retail Store').trim(),
      status: String(storeDto['status'] || 'active').trim(),
      notes: String(storeDto['notes'] || '').trim(),
    };

    return this.retailersService.update(id, {
      stores: [...currentStores, newStore],
    } as UpdateRetailerSetupDto);
  }

  @Delete(':id/stores/:storeCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeStore(
    @Param('id') id: string,
    @Param('storeCode') storeCode: string,
  ): void {
    const retailer = this.retailersService.findOne(id);
    const stores = (retailer.stores || []).filter(
      (s) => s.code !== storeCode,
    );
    this.retailersService.update(id, { stores } as UpdateRetailerSetupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    return this.retailersService.remove(id);
  }
}
