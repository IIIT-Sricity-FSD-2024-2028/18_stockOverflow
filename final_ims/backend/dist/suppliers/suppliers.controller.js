"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const create_supplier_setup_dto_1 = require("./dto/create-supplier-setup.dto");
const update_supplier_setup_dto_1 = require("./dto/update-supplier-setup.dto");
const suppliers_service_1 = require("./suppliers.service");
const uploadsSupplierPath = (0, path_1.join)(process.cwd(), 'uploads', 'suppliers');
const multerSupplierStorage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadsSupplierPath)) {
            fs.mkdirSync(uploadsSupplierPath, { recursive: true });
        }
        cb(null, uploadsSupplierPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = (0, path_1.extname)(file.originalname).toLowerCase() || '.pdf';
        cb(null, `doc-${uniqueSuffix}${ext}`);
    },
});
const multerSupplierOptions = {
    storage: multerSupplierStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
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
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.csv', '.docx', '.doc'];
        if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException('Invalid file type. Only PDF, PNG, JPEG, WEBP, CSV, and DOCX files are allowed for Supplier documents.'), false);
        }
    },
};
let SuppliersController = class SuppliersController {
    constructor(suppliersService) {
        this.suppliersService = suppliersService;
    }
    createSupplier(dto) {
        return this.suppliersService.create(dto);
    }
    create(createSupplierSetupDto) {
        return this.suppliersService.create(createSupplierSetupDto);
    }
    findAll() {
        return this.suppliersService.findAll();
    }
    getDirectory() {
        return this.suppliersService.getDirectory();
    }
    findLatest() {
        return this.suppliersService.findLatest();
    }
    findByBusinessEmail(email) {
        return this.suppliersService.findByBusinessEmail(email);
    }
    uploadDocument(id, file, docType) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded or file extension was rejected.');
        }
        return this.suppliersService.addDocument(id, file, docType || 'General Certification');
    }
    getDocuments(id) {
        return this.suppliersService.getDocuments(id);
    }
    removeDocument(id, docId) {
        return this.suppliersService.removeDocument(id, docId);
    }
    findOne(id) {
        return this.suppliersService.findOne(id);
    }
    updatePut(id, dto) {
        return this.suppliersService.update(id, dto);
    }
    update(id, updateSupplierSetupDto) {
        return this.suppliersService.update(id, updateSupplierSetupDto);
    }
    remove(id) {
        return this.suppliersService.remove(id);
    }
};
exports.SuppliersController = SuppliersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supplier_setup_dto_1.CreateSupplierSetupDto]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], SuppliersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('directory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], SuppliersController.prototype, "getDirectory", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('by-email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "findByBusinessEmail", null);
__decorate([
    (0, common_1.Post)(':id/upload-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multerSupplierOptions)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('docType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], SuppliersController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Delete)(':id/documents/:docId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "removeDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "updatePut", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_supplier_setup_dto_1.UpdateSupplierSetupDto]),
    __metadata("design:returntype", Object)
], SuppliersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "remove", null);
exports.SuppliersController = SuppliersController = __decorate([
    (0, common_1.Controller)('suppliers'),
    __metadata("design:paramtypes", [suppliers_service_1.SuppliersService])
], SuppliersController);
//# sourceMappingURL=suppliers.controller.js.map