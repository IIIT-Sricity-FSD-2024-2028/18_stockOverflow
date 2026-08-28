import { Module } from '@nestjs/common';
import { RetailersController } from './retailers.controller';
import { RetailersService } from './retailers.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [RetailersController],
  providers: [RetailersService],
  exports: [RetailersService],
})
export class RetailersModule {}
