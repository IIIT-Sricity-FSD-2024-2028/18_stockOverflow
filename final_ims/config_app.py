import re

with open(r'd:\FFSD\18_stockOverflow\final_ims\backend\src\app.module.ts', 'r', encoding='utf-8') as f:
    file = f.read()

import_regex = re.compile(r"import \{ Module \} from '@nestjs/common';")
new_import = """import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggingMiddleware, SecurityMiddleware } from './common/middlewares';
import { AuditRouterMiddleware } from './common/router.middleware';
import { GlobalExceptionFilter } from './common/http-exception.filter';"""

file = import_regex.sub(new_import, file)

class_regex = re.compile(r"export class AppModule \{\}")
new_class = """export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Global Middleware (Security & Logging)
    consumer
      .apply(SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
      
    // 2. Router-level Middleware
    consumer
      .apply(AuditRouterMiddleware)
      .forRoutes('products/upload');
  }
}"""

file = file.replace("export class AppModule {}", new_class)

providers_regex = re.compile(r"imports: \[")
new_providers = """providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter, // 3. Global Exception Filter (Error Handling)
    },
  ],
  imports: ["""

file = file.replace("imports: [", new_providers)

with open(r'd:\FFSD\18_stockOverflow\final_ims\backend\src\app.module.ts', 'w', encoding='utf-8') as f:
    f.write(file)
