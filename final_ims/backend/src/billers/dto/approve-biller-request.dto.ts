import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { trimString } from '../../common/dto.transforms';

export class ApproveBillerRequestDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  retailerId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  storeId?: string;
}
