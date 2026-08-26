"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierAuditMiddleware = exports.AuditRouterMiddleware = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
let AuditRouterMiddleware = class AuditRouterMiddleware {
    use(req, res, next) {
        logger_service_1.LoggerService.logAccess(`[AUDIT] Action invoked on route: [${req.method}] ${req.originalUrl}`);
        next();
    }
};
exports.AuditRouterMiddleware = AuditRouterMiddleware;
exports.AuditRouterMiddleware = AuditRouterMiddleware = __decorate([
    (0, common_1.Injectable)()
], AuditRouterMiddleware);
let SupplierAuditMiddleware = class SupplierAuditMiddleware {
    use(req, res, next) {
        const userAgent = req.headers['user-agent'] || 'Unknown-Client';
        logger_service_1.LoggerService.logAccess(`[SUPPLIER-ROUTER-MIDDLEWARE] [${req.method}] ${req.originalUrl} | Client: ${userAgent}`);
        next();
    }
};
exports.SupplierAuditMiddleware = SupplierAuditMiddleware;
exports.SupplierAuditMiddleware = SupplierAuditMiddleware = __decorate([
    (0, common_1.Injectable)()
], SupplierAuditMiddleware);
//# sourceMappingURL=router.middleware.js.map