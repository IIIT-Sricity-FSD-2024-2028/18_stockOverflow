"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWarehouseDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_warehouse_dto_1 = require("./create-warehouse.dto");
class UpdateWarehouseDto extends (0, mapped_types_1.PartialType)(create_warehouse_dto_1.CreateWarehouseDto) {
}
exports.UpdateWarehouseDto = UpdateWarehouseDto;
//# sourceMappingURL=update-warehouse.dto.js.map