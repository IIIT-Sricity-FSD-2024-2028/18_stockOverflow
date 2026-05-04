import { Controller, Get, Query } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(@Query('retailerId') retailerId?: string) {
    return this.storesService.findAll(retailerId);
  }
}
