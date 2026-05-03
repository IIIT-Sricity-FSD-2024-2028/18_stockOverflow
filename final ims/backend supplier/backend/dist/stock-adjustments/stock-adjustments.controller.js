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
exports.StockAdjustmentsController = void 0;
const common_1 = require("@nestjs/common");
const create_stock_adjustment_dto_1 = require("./dto/create-stock-adjustment.dto");
const update_stock_adjustment_dto_1 = require("./dto/update-stock-adjustment.dto");
const stock_adjustments_service_1 = require("./stock-adjustments.service");
let StockAdjustmentsController = class StockAdjustmentsController {
    constructor(stockAdjustmentsService) {
        this.stockAdjustmentsService = stockAdjustmentsService;
    }
    create(createStockAdjustmentDto) {
        return this.stockAdjustmentsService.create(createStockAdjustmentDto);
    }
    findAll() {
        return this.stockAdjustmentsService.findAll();
    }
    findOne(id) {
        return this.stockAdjustmentsService.findOne(id);
    }
    update(id, updateStockAdjustmentDto) {
        return this.stockAdjustmentsService.update(id, updateStockAdjustmentDto);
    }
    remove(id) {
        return this.stockAdjustmentsService.remove(id);
    }
};
exports.StockAdjustmentsController = StockAdjustmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_adjustment_dto_1.CreateStockAdjustmentDto]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_stock_adjustment_dto_1.UpdateStockAdjustmentDto]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "remove", null);
exports.StockAdjustmentsController = StockAdjustmentsController = __decorate([
    (0, common_1.Controller)('stock-adjustments'),
    __metadata("design:paramtypes", [stock_adjustments_service_1.StockAdjustmentsService])
], StockAdjustmentsController);
//# sourceMappingURL=stock-adjustments.controller.js.map