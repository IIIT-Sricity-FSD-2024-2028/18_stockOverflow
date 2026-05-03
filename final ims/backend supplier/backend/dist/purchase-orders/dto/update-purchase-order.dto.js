"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePurchaseOrderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_purchase_order_dto_1 = require("./create-purchase-order.dto");
class UpdatePurchaseOrderDto extends (0, mapped_types_1.PartialType)(create_purchase_order_dto_1.CreatePurchaseOrderDto) {
}
exports.UpdatePurchaseOrderDto = UpdatePurchaseOrderDto;
//# sourceMappingURL=update-purchase-order.dto.js.map