"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMiddleware = exports.LoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
let LoggingMiddleware = class LoggingMiddleware {
    use(req, res, next) {
        const start = Date.now();
        const { method, originalUrl, ip } = req;
        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;
            logger_service_1.LoggerService.logAccess(`[${method}] ${originalUrl} ${statusCode} - ${duration}ms - IP: ${ip}`);
        });
        next();
    }
};
exports.LoggingMiddleware = LoggingMiddleware;
exports.LoggingMiddleware = LoggingMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggingMiddleware);
let SecurityMiddleware = class SecurityMiddleware {
    use(req, res, next) {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-Download-Options', 'noopen');
        next();
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = __decorate([
    (0, common_1.Injectable)()
], SecurityMiddleware);
//# sourceMappingURL=middlewares.js.map