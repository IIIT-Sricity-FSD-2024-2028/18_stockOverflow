import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductFeedbackDto } from './dto/create-product-feedback.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.productsService.findAll(retailerId, storeId);
  }

  @Get('sku/:sku')
  findBySku(
    @Param('sku') sku: string,
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.productsService.findBySku(sku, retailerId, storeId);
  }

  @Get('sku/:sku/feedback')
  getFeedback(
    @Param('sku') sku: string,
    @Query('retailerId') retailerId?: string,
  ) {
    return this.productsService.getFeedback(sku, retailerId);
  }

  @Get('sku/:sku/rating-summary')
  getRatingSummary(
    @Param('sku') sku: string,
    @Query('retailerId') retailerId?: string,
  ) {
    return this.productsService.getRatingSummary(sku, retailerId);
  }

  @Post('sku/:sku/feedback')
  addFeedback(
    @Param('sku') sku: string,
    @Body() createProductFeedbackDto: CreateProductFeedbackDto,
    @Query('retailerId') retailerId?: string,
  ) {
    return this.productsService.addFeedback(
      sku,
      createProductFeedbackDto,
      retailerId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.productsService.findOne(id, retailerId, storeId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
