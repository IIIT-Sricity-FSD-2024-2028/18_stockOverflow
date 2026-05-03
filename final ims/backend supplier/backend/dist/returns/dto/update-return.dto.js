"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReturnDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_return_dto_1 = require("./create-return.dto");
class UpdateReturnDto extends (0, mapped_types_1.PartialType)(create_return_dto_1.CreateReturnDto) {
}
exports.UpdateReturnDto = UpdateReturnDto;
//# sourceMappingURL=update-return.dto.js.map