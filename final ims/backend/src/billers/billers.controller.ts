import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Put,
} from '@nestjs/common';
import { BillersService } from './billers.service';
import { CreateBillerDto } from './dto/create-biller.dto';
import { UpdateBillerDto } from './dto/update-biller.dto';

@Controller('billers')
export class BillersController {
  constructor(private readonly billersService: BillersService) {}

  @Post()
  create(@Body() createBillerDto: CreateBillerDto) {
    return this.billersService.create(createBillerDto);
  }

  @Get()
  findAll(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.billersService.findAll(retailerId, storeId);
  }

  // Biller request endpoints
  @Post('requests')
  createRequest(@Body() requestData: any) {
    return this.billersService.createRequest(requestData);
  }

  @Get('requests')
  getRequests() {
    return this.billersService.getRequests();
  }

  @Put('requests/:id/approve')
  approveRequest(@Param('id') id: string) {
    return this.billersService.approveRequest(id);
  }

  @Put('requests/:id/reject')
  rejectRequest(@Param('id') id: string) {
    return this.billersService.rejectRequest(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billersService.findOne(id);
  }
}
