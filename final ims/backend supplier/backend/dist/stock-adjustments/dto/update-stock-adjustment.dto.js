"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStockAdjustmentDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_stock_adjustment_dto_1 = require("./create-stock-adjustment.dto");
class UpdateStockAdjustmentDto extends (0, mapped_types_1.PartialType)(create_stock_adjustment_dto_1.CreateStockAdjustmentDto) {
}
exports.UpdateStockAdjustmentDto = UpdateStockAdjustmentDto;
//# sourceMappingURL=update-stock-adjustment.dto.js.map