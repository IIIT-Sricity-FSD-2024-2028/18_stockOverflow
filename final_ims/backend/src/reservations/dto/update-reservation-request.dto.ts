import { IsOptional, IsString } from 'class-validator';

export class UpdateReservationRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  completedBy?: string;

  @IsOptional()
  @IsString()
  confirmationShownAt?: string;
}
