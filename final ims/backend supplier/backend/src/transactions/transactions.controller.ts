import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('latest')
  findLatest() {
    return this.transactionsService.findLatest();
  }

  @Get('purchased-products')
  findPurchasedProducts() {
    return this.transactionsService.getPurchasedProducts();
  }

  @Get(':orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.transactionsService.findOne(orderId);
  }

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Patch(':orderId')
  update(
    @Param('orderId') orderId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(orderId, updateTransactionDto);
  }

  @Delete(':orderId')
  remove(@Param('orderId') orderId: string) {
    return this.transactionsService.remove(orderId);
  }

  @Post('reconcile')
  reconcileInventory() {
    return this.transactionsService.reconcileInventory();
  }
}
