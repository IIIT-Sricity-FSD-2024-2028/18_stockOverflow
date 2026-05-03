"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBillerDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_biller_dto_1 = require("./create-biller.dto");
class UpdateBillerDto extends (0, mapped_types_1.PartialType)(create_biller_dto_1.CreateBillerDto) {
}
exports.UpdateBillerDto = UpdateBillerDto;
//# sourceMappingURL=update-biller.dto.js.map