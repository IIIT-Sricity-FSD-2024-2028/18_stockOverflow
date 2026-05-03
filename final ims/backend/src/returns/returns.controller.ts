import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Put,
} from '@nestjs/common';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
  ) {
    return this.returnsService.findAll(retailerId, storeId, customerLookup);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
  ) {
    return this.returnsService.findOne(
      id,
      retailerId,
      storeId,
      customerLookup,
    );
  }

  @Post()
  create(@Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.create(createReturnDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReturnDto: UpdateReturnDto) {
    return this.returnsService.update(id, updateReturnDto);
  }
}
