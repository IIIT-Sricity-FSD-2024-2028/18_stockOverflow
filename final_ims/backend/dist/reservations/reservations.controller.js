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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const create_reservation_request_dto_1 = require("./dto/create-reservation-request.dto");
const update_reservation_request_dto_1 = require("./dto/update-reservation-request.dto");
const reservations_service_1 = require("./reservations.service");
let ReservationsController = class ReservationsController {
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    findAll(storeId) {
        return this.reservationsService.findAll(storeId);
    }
    findRequests(status, customer) {
        return this.reservationsService.findRequests(status, customer);
    }
    findRequest(requestId) {
        return this.reservationsService.findRequest(requestId);
    }
    createRequest(createReservationRequestDto) {
        return this.reservationsService.createRequest(createReservationRequestDto);
    }
    updateRequest(requestId, updateReservationRequestDto) {
        return this.reservationsService.updateRequest(requestId, updateReservationRequestDto);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('customer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findRequests", null);
__decorate([
    (0, common_1.Get)('requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findRequest", null);
__decorate([
    (0, common_1.Post)('requests'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservation_request_dto_1.CreateReservationRequestDto]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reservation_request_dto_1.UpdateReservationRequestDto]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "updateRequest", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map