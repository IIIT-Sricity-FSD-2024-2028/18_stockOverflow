# API Documentation

- Swagger UI is available at `/api/docs` when the backend is running.
- The generated OpenAPI file is stored at `docs/swagger.json`.
- The same JSON document is exposed by the app at `/api/docs/json`.
- Regenerate the documentation with `npm run swagger:generate`.

## Role Header

Every documented endpoint includes a `role` header description in Swagger.
Supported role values are `admin`, `retailer`, `supplier`, `consumer`, and `biller`.
