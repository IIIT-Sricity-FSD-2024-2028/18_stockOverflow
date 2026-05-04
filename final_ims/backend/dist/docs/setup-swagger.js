"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const logger = new common_1.Logger('Swagger');
function resolveSwaggerDocumentPath() {
    const candidates = [
        (0, node_path_1.join)(process.cwd(), 'docs', 'swagger.json'),
        (0, node_path_1.join)(__dirname, '..', '..', 'docs', 'swagger.json'),
    ];
    return candidates.find((candidate) => (0, node_fs_1.existsSync)(candidate));
}
function setupSwagger(app) {
    const documentPath = resolveSwaggerDocumentPath();
    if (!documentPath) {
        logger.warn('Swagger document not found. Run `npm run swagger:generate`.');
        return;
    }
    const document = JSON.parse((0, node_fs_1.readFileSync)(documentPath, 'utf-8'));
    swagger_1.SwaggerModule.setup('docs', app, document, {
        useGlobalPrefix: true,
        customSiteTitle: 'Stock Overflow API Docs',
        jsonDocumentUrl: 'docs/json',
        swaggerOptions: {
            displayRequestDuration: true,
            docExpansion: 'list',
            persistAuthorization: true,
        },
    });
}
//# sourceMappingURL=setup-swagger.js.map