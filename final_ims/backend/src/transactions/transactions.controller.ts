import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

const receiptUploadsDir = path.join(process.cwd(), 'uploads', 'receipts');
if (!fs.existsSync(receiptUploadsDir)) {
  fs.mkdirSync(receiptUploadsDir, { recursive: true });
}

const receiptMulterOptions = {
  storage: diskStorage({
    destination: receiptUploadsDir,
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `receipt-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf)$/)) {
      return cb(
        new BadRequestException('Only image files (JPEG, PNG, WEBP, GIF) and PDFs are allowed.'),
        false,
      );
    }
    cb(null, true);
  },
};

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
  ) {
    return this.transactionsService.findAll(
      retailerId,
      storeId,
      customerLookup,
    );
  }

  @Get('latest')
  findLatest(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
  ) {
    return this.transactionsService.findLatest(
      retailerId,
      storeId,
      customerLookup,
    );
  }

  @Get('purchased-products')
  findPurchasedProducts(
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
  ) {
    return this.transactionsService.getPurchasedProducts(
      retailerId,
      storeId,
      customerLookup,
    );
  }

  @Post('upload-receipt')
  @UseInterceptors(FileInterceptor('file', receiptMulterOptions))
  uploadReceiptFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Receipt file is required.');
    }
    const relativeUrl = `/uploads/receipts/${file.filename}`;
    return {
      message: 'Receipt file uploaded successfully',
      url: relativeUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Post(':orderId/receipt')
  @UseInterceptors(FileInterceptor('file', receiptMulterOptions))
  attachReceiptFile(
    @Param('orderId') orderId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Receipt file is required.');
    }
    const relativeUrl = `/uploads/receipts/${file.filename}`;
    return this.transactionsService.attachReceipt(orderId, relativeUrl);
  }

  @Get(':orderId')
  findOne(
    @Param('orderId') orderId: string,
    @Query('retailerId') retailerId?: string,
    @Query('storeId') storeId?: string,
    @Query('customer') customerLookup?: string,
  ) {
    return this.transactionsService.findOne(
      orderId,
      retailerId,
      storeId,
      customerLookup,
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

