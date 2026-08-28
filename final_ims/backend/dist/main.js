"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const setup_swagger_1 = require("./docs/setup-swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
<<<<<<< Updated upstream
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const productUploadsDir = path.join(uploadsDir, 'products');
    const supplierUploadsDir = path.join(uploadsDir, 'suppliers');
    [productUploadsDir, supplierUploadsDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    app.use('/uploads', express.static(uploadsDir));
=======
>>>>>>> Stashed changes
    app.use((0, express_1.json)({ limit: '25mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '25mb' }));
    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    (0, setup_swagger_1.setupSwagger)(app);
    await app.listen(process.env.PORT ?? 3001);
    console.log('NestJS Backend Server listening on http://localhost:3001/api');
}
void bootstrap();
//# sourceMappingURL=main.js.map