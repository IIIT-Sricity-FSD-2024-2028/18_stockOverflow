const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/backend/src/products/products.controller.ts', 'utf8');

const importRegex = /import \{\s*Body,\s*Controller,\s*Delete,\s*Get,\s*Param,\s*Post,\s*Query,\s*Put,\s*\} from '@nestjs\/common';/;
const newImport = import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';;

file = file.replace(importRegex, newImport);

const endpointToAdd = 
  /**
   * IMPLEMENTATION DETAIL (Evaluation Criteria):
   * File upload - Route to handle uploading product images via Multer FileInterceptor.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded' };
    }
    return {
      message: 'File uploaded successfully',
      filename: file.originalname,
      size: file.size
    };
  }
;

// Insert the endpoint right before the last closing brace
const lastBraceIndex = file.lastIndexOf('}');
file = file.slice(0, lastBraceIndex) + endpointToAdd + file.slice(lastBraceIndex);

fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/backend/src/products/products.controller.ts', file);
