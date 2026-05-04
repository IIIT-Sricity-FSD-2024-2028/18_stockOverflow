# Stock Overflow - Project Overview & Implementation Guide

## 1. Project Overview
**Stock Overflow** is a modern, high-fidelity Inventory Lifecycle Management System designed for complex retail operations. It provides a centralized command center to track inventory, manage multi-stakeholder supply chains (Administrators, Retailers, Suppliers, Consumers, and Billers), and streamline real-time stock synchronization and analytics.

## 2. Technology Stack
- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+), and Vanilla CSS3 with Custom Properties (CSS Variables). No heavy frameworks (like React or Angular) are used.
- **Backend**: NestJS (TypeScript framework for Node.js).
- **Data Persistence**: 
  - **Backend**: JSON file-based database engine (`db.json`, `users.json`, `retailers.json`, `suppliers.json` inside the `backend/data/` directory).
  - **Frontend**: Local storage data fallback/mock engine (`mockData.js`, `commerceData.js`) simulating a database when the backend API is unavailable or for local evaluation.

## 3. Core Architecture & Modules

### Backend Structure (`backend/src/`)
The backend follows a modular NestJS architecture with RESTful endpoints. Each domain entity is separated into its own module:
- **`users`**: Handles User Management, Authentication (login), and Role-Based Access Control (RBAC).
- **`retailers`, `suppliers`, `customers`, `billers`**: Stakeholder-specific modules.
- **`stores`, `warehouses`**: Location and facility management (supports multi-store capabilities for a single retailer).
- **`products`**: Product catalog, SKUs, feedbacks, and rating summaries.
- **`inventory logic`**: Modules like `stock-adjustments`, `transactions`, `purchase-orders`, `reservations`, and `returns` handle the complex state machine of inventory moving through the supply chain.

### Frontend Structure (`frontend/`)
The frontend organizes its UI by user roles/modules:
- **`admin/`**: Administrative dashboard, user management, and multi-store setup.
- **`Retailer module/`**: Specialized tools for inventory tracking, order management, and store-level analytics.
- **`supplier module/`**: Portal for managing supply chains, shipments, and inventory replenishment.
- **`customer module/`**: Consumer-facing interface for product browsing and order tracking.
- **`biller module/`**: Point-of-Sale (POS) and billing interface for retail staff.
- **`auth/`**: Secure login and registration flows.
- **`js/`**: Core application logic. `api-config.js` provides the `IMS_HTTP.request` wrapper to communicate with the backend.
- **`css/`**: Global design system, including glassmorphism effects, modern typography, and dynamic micro-animations.

## 4. Key Features & Roles

- **Multi-Store Support**: Retailers can seamlessly manage multiple physical locations. The backend supports this via `storeId` and `retailerId` query parameters across endpoints.
- **Role-Based Access Control (RBAC)**: Fine-grained access for Admin, Retailer, Supplier, Consumer, and Biller.
- **Real-Time Inventory Tracking**: Unified analytics and dynamic simulation of sales, revenue, and stock levels.
- **Smart Alerts & Analytics**: Predictive capabilities for low stock and supply chain performance insights.
- **High-Fidelity Aesthetics**: Uses modern UI/UX design trends, vibrant color palettes, interactive elements, and custom-built components.

## 5. Implementation Guide (For Prompting)

When prompting an AI assistant or writing new code for this project, keep the following patterns and rules in mind:

### Frontend Implementation Rules
1. **API Communication**: Always use the `IMS_HTTP.request(path, options)` wrapper defined in `frontend/js/api-config.js` to make network requests. It automatically resolves the correct `IMS_API_BASE_URL` (usually `http://localhost:3001/api`).
2. **Styling**: Do not use TailwindCSS or external CSS frameworks. Rely purely on Vanilla CSS. Use the existing CSS variables defined in `frontend/css/global.css` and `components.css`. Create premium, dynamic designs (glassmorphism, smooth hover effects, micro-animations).
3. **No Frameworks**: Build views using raw HTML and manage state using Vanilla JS. Use the `IntersectionObserver` patterns already established in `index.html` for scroll reveals and animations.
4. **Data Fallback**: When adding new features, consider handling scenarios where the backend might be unreachable by falling back to `localStorage` mock data.

### Backend Implementation Rules
1. **NestJS Paradigms**: Follow standard NestJS module generation (`Controller`, `Service`, `Module`, `DTO`s).
2. **JSON Database Engine**: Since the backend uses a local JSON file store (e.g., in `users.service.ts`), you must persist changes by reading from the map/array, updating it, and writing back to the disk using `node:fs` methods (`readFileSync`, `writeFileSync`).
3. **Multi-Tenancy**: Most `GET` and `POST` requests in controllers (like `products.controller.ts`) accept `retailerId` and `storeId` as query parameters. Ensure that any new entity fetching logic correctly scopes data using these parameters to avoid leaking data across stores.
4. **DTO Validation**: Use `class-validator` and `class-transformer` decorators in DTOs (e.g., `@IsString()`, `@IsOptional()`) to ensure strict typing and input validation.

### Workflow for Adding a New Feature
1. **Backend**: 
   - Define the DTOs for the feature.
   - Create the Controller with appropriate endpoints.
   - Implement the Service logic (ensure reading/writing to the JSON store is handled securely).
   - Register the Module in `AppModule`.
2. **Frontend**:
   - Create or update the HTML file in the respective role's folder.
   - Add vanilla CSS styling for any new components.
   - Implement Vanilla JS logic to interface with the backend using `IMS_HTTP.request` and manipulate the DOM directly.
