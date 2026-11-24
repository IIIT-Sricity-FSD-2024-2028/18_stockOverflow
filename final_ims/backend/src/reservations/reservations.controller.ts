import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll(@Query('storeId') storeId?: string) {
    return this.reservationsService.findAll(storeId);
  }

  @Get('requests')
  findRequests(
    @Query('status') status?: string,
    @Query('customer') customer?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.reservationsService.findRequests(status, customer, storeId);
  }

  @Get('requests/:requestId')
  findRequest(@Param('requestId') requestId: string) {
    return this.reservationsService.findRequest(requestId);
  }

  @Post('requests')
  createRequest(@Body() createReservationRequestDto: CreateReservationRequestDto) {
    return this.reservationsService.createRequest(createReservationRequestDto);
  }

  @Patch('requests/:requestId/cancel')
  cancelRequest(
    @Param('requestId') requestId: string,
    @Body() body?: { reason?: string; cancelledBy?: string },
  ) {
    return this.reservationsService.cancelRequest(
      requestId,
      body?.reason,
      body?.cancelledBy,
    );
  }

  @Patch('requests/:requestId')
  updateRequest(
    @Param('requestId') requestId: string,
    @Body() updateReservationRequestDto: UpdateReservationRequestDto,
  ) {
    return this.reservationsService.updateRequest(
      requestId,
      updateReservationRequestDto,
    );
  }
}
