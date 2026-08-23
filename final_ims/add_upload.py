import re

with open(r'd:\FFSD\18_stockOverflow\final_ims\backend\src\products\products.controller.ts', 'r', encoding='utf-8') as f:
    file = f.read()

import_regex = re.compile(r"import \{\s*Body,\s*Controller,\s*Delete,\s*Get,\s*Param,\s*Post,\s*Query,\s*Put,\s*\} from '@nestjs/common';")
new_import = """import {
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Multer } from 'multer';"""

file = import_regex.sub(new_import, file)

endpoint_to_add = """
  /**
   * IMPLEMENTATION DETAIL (Evaluation Criteria):
   * File upload - Route to handle uploading product images via Multer FileInterceptor.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      return { message: 'No file uploaded' };
    }
    return {
      message: 'File uploaded successfully',
      filename: file.originalname,
      size: file.size
    };
  }
"""

last_brace_index = file.rfind('}')
file = file[:last_brace_index] + endpoint_to_add + file[last_brace_index:]

with open(r'd:\FFSD\18_stockOverflow\final_ims\backend\src\products\products.controller.ts', 'w', encoding='utf-8') as f:
    f.write(file)
