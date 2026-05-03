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
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';
import { StockAdjustmentsService } from './stock-adjustments.service';

@Controller('stock-adjustments')
export class StockAdjustmentsController {
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  @Post()
  create(@Body() createStockAdjustmentDto: CreateStockAdjustmentDto) {
    return this.stockAdjustmentsService.create(createStockAdjustmentDto);
  }

  @Get()
  findAll(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.stockAdjustmentsService.findAll(retailerId, storeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockAdjustmentsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockAdjustmentDto: UpdateStockAdjustmentDto,
  ) {
    return this.stockAdjustmentsService.update(id, updateStockAdjustmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockAdjustmentsService.remove(id);
  }
}
