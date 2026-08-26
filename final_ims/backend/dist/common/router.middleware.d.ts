import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class AuditRouterMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class SupplierAuditMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
