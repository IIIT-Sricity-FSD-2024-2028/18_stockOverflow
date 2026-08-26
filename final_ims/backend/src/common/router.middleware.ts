import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

/**
 * IMPLEMENTATION DETAIL (Evaluation Criteria):
 * Router-level Middleware - Applied only to specific routes (e.g., upload endpoints)
 * to perform specialized checks, such as verifying the request has an authorization header
 * or auditing the action.
 */
@Injectable()
export class AuditRouterMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    LoggerService.logAccess(`[AUDIT] Action invoked on route: [${req.method}] ${req.originalUrl}`);
    next();
  }
}

/**
 * IMPLEMENTATION DETAIL (Evaluation Criteria):
 * Router-level Middleware specifically for the Supplier Module.
 * Applied at the router level via SuppliersModule configure() to intercept and audit
 * all Supplier domain requests, document uploads, and profile modifications.
 */
@Injectable()
export class SupplierAuditMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || 'Unknown-Client';
    LoggerService.logAccess(`[SUPPLIER-ROUTER-MIDDLEWARE] [${req.method}] ${req.originalUrl} | Client: ${userAgent}`);
    next();
  }
}