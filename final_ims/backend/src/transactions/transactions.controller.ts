import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
    @Query('customerEmail') customerEmail?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.transactionsService.findAll(
      retailerId,
      storeId,
      [customerLookup, customerEmail, customerId],
    );
  }

  @Get('latest')
  findLatest(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
    @Query('customerEmail') customerEmail?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.transactionsService.findLatest(
      retailerId,
      storeId,
      [customerLookup, customerEmail, customerId],
    );
  }

  @Get('purchased-products')
  findPurchasedProducts(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
    @Query('customerEmail') customerEmail?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.transactionsService.getPurchasedProducts(
      retailerId,
      storeId,
      [customerLookup, customerEmail, customerId],
    );
  }

  @Get(':orderId')
  findOne(
    @Param('orderId') orderId: string,
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
    @Query('customerEmail') customerEmail?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.transactionsService.findOne(
      orderId,
      retailerId,
      storeId,
      [customerLookup, customerEmail, customerId],
    );
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
