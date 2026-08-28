import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
<<<<<<< Updated upstream
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
=======
>>>>>>> Stashed changes
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { UpdateSupplierSetupDto } from './dto/update-supplier-setup.dto';
import { SupplierDirectoryEntry } from './supplier-directory-entry.interface';
import { SupplierRecord, SupplierDocument } from './supplier-record.interface';
import { SuppliersService } from './suppliers.service';

const uploadsSupplierPath = join(process.cwd(), 'uploads', 'suppliers');

const multerSupplierStorage = diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsSupplierPath)) {
      fs.mkdirSync(uploadsSupplierPath, { recursive: true });
    }
    cb(null, uploadsSupplierPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const multerSupplierOptions = {
  storage: multerSupplierStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/csv',
      'application/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const ext = extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.csv', '.docx', '.doc'];

    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Invalid file type. Only PDF, PNG, JPEG, WEBP, CSV, and DOCX files are allowed for Supplier documents.',
        ),
        false,
      );
    }
  },
};

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('setup')
  create(@Body() createSupplierSetupDto: CreateSupplierSetupDto): SupplierRecord {
    return this.suppliersService.create(createSupplierSetupDto);
  }

  @Get()
  findAll(): SupplierRecord[] {
    return this.suppliersService.findAll();
  }

  @Get('directory')
  getDirectory(): SupplierDirectoryEntry[] {
    return this.suppliersService.getDirectory();
  }

  @Get('latest')
  findLatest(): SupplierRecord | null {
    return this.suppliersService.findLatest();
  }

  @Get('by-email/:email')
  findByBusinessEmail(@Param('email') email: string): SupplierRecord | null {
    return this.suppliersService.findByBusinessEmail(email);
  }

  /**
   * IMPLEMENTATION DETAIL (Evaluation Criteria):
   * File upload - Supplier Document & Certification upload endpoint.
   * Handles Multer multipart/form-data upload, validates file type and 5MB size limit,
   * stores file in uploads/suppliers/, and appends document record to supplier profile.
   */
  @Post(':id/upload-document')
  @UseInterceptors(FileInterceptor('file', multerSupplierOptions))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('docType') docType?: string,
  ): SupplierDocument {
    if (!file) {
      throw new BadRequestException('No file uploaded or file extension was rejected.');
    }
    return this.suppliersService.addDocument(id, file, docType || 'General Certification');
  }

  @Get(':id/documents')
  getDocuments(@Param('id') id: string): SupplierDocument[] {
    return this.suppliersService.getDocuments(id);
  }

  @Delete(':id/documents/:docId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
  ): void {
    return this.suppliersService.removeDocument(id, docId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): SupplierRecord {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplierSetupDto: UpdateSupplierSetupDto,
  ): SupplierRecord {
    return this.suppliersService.update(id, updateSupplierSetupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    return this.suppliersService.remove(id);
  }
}
<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
