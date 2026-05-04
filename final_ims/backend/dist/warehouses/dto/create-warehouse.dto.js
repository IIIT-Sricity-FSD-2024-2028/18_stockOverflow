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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWarehouseDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const dto_transforms_1 = require("../../common/dto.transforms");
const WAREHOUSE_STATUSES = ['active', 'inactive'];
class WarehouseInventoryItemDto {
}
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], WarehouseInventoryItemDto.prototype, "sku", void 0);
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], WarehouseInventoryItemDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], WarehouseInventoryItemDto.prototype, "cat", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WarehouseInventoryItemDto.prototype, "qty", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WarehouseInventoryItemDto.prototype, "max", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WarehouseInventoryItemDto.prototype, "price", void 0);
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], WarehouseInventoryItemDto.prototype, "emoji", void 0);
class WarehouseZoneDto {
}
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], WarehouseZoneDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WarehouseZoneDto.prototype, "used", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WarehouseZoneDto.prototype, "total", void 0);
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], WarehouseZoneDto.prototype, "color", void 0);
class CreateWarehouseDto {
}
exports.CreateWarehouseDto = CreateWarehouseDto;
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "contact", void 0);
__decorate([
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateWarehouseDto.prototype, "totalProducts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateWarehouseDto.prototype, "totalStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(dto_transforms_1.trimString),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "createdOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateWarehouseDto.prototype, "createdTs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(WAREHOUSE_STATUSES),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WarehouseInventoryItemDto),
    __metadata("design:type", Array)
], CreateWarehouseDto.prototype, "inventory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WarehouseZoneDto),
    __metadata("design:type", Array)
], CreateWarehouseDto.prototype, "zones", void 0);
//# sourceMappingURL=create-warehouse.dto.js.map