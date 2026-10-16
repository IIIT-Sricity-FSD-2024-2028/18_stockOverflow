# StockOverflow – Multi-Stakeholder Inventory Lifecycle Management System

A high-performance, full-stack Inventory Lifecycle Management System connecting **Retailers**, **Cashier Billers (POS)**, **Suppliers**, **Consumers**, **Employees**, and **Platform Administrators** into a unified, data-synchronized digital commerce ecosystem.

---

## 1. Project Overview & Architecture

**StockOverflow** addresses the challenges faced by modern retail enterprises and local multi-store kirana chains: disparate inventory silos, inaccurate stock counts, manual purchase ordering, delayed deliveries, and lack of real-time point-of-sale and consumer visibility.

The platform provides a centralized hub featuring:
- **Multi-Store Retailer Portal**: Store-level inventory tracking, stock adjustments, vendor scorecards, automated purchase order lifecycles, and POS staff management.
- **Cashier POS Billing Terminal**: Barcode scanning, cart calculation, instantaneous stock decrementing, and omnichannel reservation hold fulfillment.
- **Supplier Distribution Portal**: Delivery coordination, purchase order acceptance, shipment tracking, and product line management.
- **Consumer Digital Storefront**: Multi-store catalog browsing, branch availability checks, pickup reservations, order tracking, and RMA returns.
- **Administrative & Employee Control**: User administration, platform revenue commission analytics, tenant auditing, and staff operations.

### Architectural Stack:
- **Backend**: NestJS (TypeScript) utilizing modular service-controller architecture, DTO validation with `class-validator`, dynamic OpenAPI/Swagger documentation, and multi-tenant JSON persistence.
- **Frontend**: React 18 SPA powered by Vite, featuring custom vanilla styling, Lucide iconography, interactive Chart.js visualizations, and responsive layouts.
- **Data Layer**: File-based multi-entity JSON storage (`backend/data/*.json`) with client-side localStorage fallback for offline resilience.

---

## 2. Directory Structure

```text
final_ims/
├── package.json                   # Workspace scripts
├── backend/                       # NestJS REST API Server
│   ├── src/                       # Controllers, Services, DTOs, Modules
│   │   ├── admin/                 # System Administration module
│   │   ├── billers/               # POS Cashier management module
│   │   ├── customers/             # Customer profiles & order histories
│   │   ├── employees/             # Staff & branch employee operations
│   │   ├── platform-revenue/      # Platform fee & commission analytics
│   │   ├── products/              # Catalog, pricing, barcodes, ratings
│   │   ├── purchase-orders/       # Purchase order workflows & status machine
│   │   ├── reservations/          # In-store pickup holds & fulfillment
│   │   ├── retailers/             # Retailer profiles, multi-store allocation
│   │   ├── returns/               # RMA returns & damaged stock processing
│   │   ├── stock-adjustments/     # Audited physical adjustments & shrinkage
│   │   ├── stores/                # Store branch registry & location settings
│   │   ├── suppliers/             # Vendor catalog & scorecard tracking
│   │   ├── transactions/          # Financial & POS transaction audit ledger
│   │   └── users/                 # RBAC authentication & credentials
│   ├── data/                      # Multi-tenant JSON file storage database
│   └── docs/                      # Generated Swagger OpenAPI specifications
└── react_frontend/                # React 18 + Vite Single Page Application
    ├── src/
    │   ├── admin/                 # Administrator dashboard & metrics
    │   ├── auth/                  # Sign In, Sign Up, & Verification gates
    │   ├── biller/                # POS billing terminal & barcode scanner
    │   ├── consumer/              # Digital shopping storefront & pickup holds
    │   ├── employee/              # Employee task desk & branch assistance
    │   ├── landing/               # Public landing page & role selector
    │   ├── retailer/              # Store Owner management portal & charts
    │   └── supplier/              # Supplier shipment portal & PO approvals
    └── vite.config.js             # Vite bundler configuration
```

---

## 3. Prerequisites & Dependencies

### System Requirements:
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or `v10.x`
- **Modern Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge

### Dependencies Overview:

#### Backend (`backend/package.json`):
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`: Core server framework
- `@nestjs/swagger`, `swagger-ui-express`: OpenAPI contract and interactive API explorer
- `class-validator`, `class-transformer`: Runtime schema validation and request sanitization
- `rxjs`: Reactive event streams
- Dev tools: `@nestjs/cli`, `typescript`, `ts-node`, `jest`, `eslint`, `prettier`

#### Frontend (`react_frontend/package.json`):
- `react`, `react-dom` (`^18.2.0`): Declarative UI library
- `vite` (`^5.1.4`), `@vitejs/plugin-react`: Ultra-fast build tool and HMR dev server
- `lucide-react` (`^0.344.0`): Consistent iconography
- `chart.js` (`^4.5.1`): Canvas-based dynamic data visualizations

---

## 4. Step-by-Step Project Setup & Execution

### Option A: Running from `final_ims/` Root

1. **Install dependencies for both apps:**
   ```bash
   npm run install:all
   ```

2. **Launch Backend (Terminal 1):**
   ```bash
   npm run start:backend
   ```

3. **Launch Frontend (Terminal 2):**
   ```bash
   npm run dev:frontend
   ```

---

### Option B: Running from Individual Folders

#### Step 1: Start the Backend (NestJS Server)
1. Open a terminal window:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run start:dev
   ```
4. **Backend Endpoints:**
   - Server Root: `http://localhost:3001`
   - REST API Base URL: `http://localhost:3001/api`
   - Interactive Swagger API Documentation: `http://localhost:3001/api/docs`

#### Step 2: Start the Frontend (React / Vite Application)
1. Open a second terminal window:
   ```bash
   cd react_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
4. **Access the Web Application:**
   - Open your browser and navigate to: **`http://localhost:5173`**

---

### Step 3: Production Build (Optional)
To validate production builds:
```bash
# In backend/
npm run build

# In react_frontend/
npm run build
npm run preview
```

---

## 5. Testing & Demonstration Instructions

### Demo Accounts & Credentials

The system comes pre-seeded with accounts for all platform roles:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Retailer (Store Owner)** | `john@gmail.com` | `pass1234` | Full access to inventory, stores, purchase orders, billers, and analytics |
| **Biller (Cashier / POS)** | `jones@gmail.com` | `pass1234` | Point-of-Sale terminal and reservation fulfillment for John's store |
| **Consumer (Shopper)** | `customer@stockoverflow.com` | `pass1234` | Storefront browsing, cart checkout, in-store pickup reservations |
| **Supplier (Vendor)** | `supplier@stockoverflow.com` | `pass1234` | Supplier fulfillment portal, PO approvals, shipment tracking |
| **System Admin** | `admin@stockoverflow.com` | `pass1234` | Platform-wide monitoring, user management, revenue commissions |
| **Employee (Staff)** | `employee@stockoverflow.com` | `pass1234` | Staff operations, branch assistance, stock updates |

---

### End-to-End Retailer Module Test Flow

Follow this structured workflow to test the comprehensive capabilities of the **Retailer Module**:

#### 1. Authentication & Dashboard Analytics
- Navigate to `http://localhost:5173` (Public Landing Page).
- Click **"Sign In"** in the top navigation bar.
- Enter `john@gmail.com` and password `pass1234`.
- **Verify**: The Retailer Command Center loads displaying real-time KPI metrics (Total Products, Total Stock Units, Low Stock Alert Count, Active Stores, Active Billers, Active Suppliers, and Total Sales Revenue).
- **Verify**: Dynamic Chart.js visualizations render inventory distribution across categories and stock status breakdowns.

#### 2. Active Store Selection & Multi-Branch Management
- Locate the **Store Selector** in the top navigation header (shows *"John's Retail Store"*).
- Navigate to **"Stores & Branches"** from the sidebar navigation.
- View the active branch listing, store codes (`JOHN-S-STORE`), contact info, and statuses.
- Click **"Add Store"** to create a second branch (e.g., *"Westside Express"*).
- Note the SaaS plan validation: Starter Kirana plan enforces store limits, prompting plan upgrade if limit is exceeded.

#### 3. Product Catalog Operations & Store-Wise Stock Allocation
- Click **"Products"** in the sidebar.
- Search for existing items (e.g., *"MacBook"*, *"Sony"*). Test category filter pills.
- Click **"+ Add Product"**:
  - Fill in Name, SKU (`PT-999`), Barcode, Category (*Electronics*), Retail Price, Cost Price, Tax %, and Min/Max thresholds.
  - In the **Store Stock Allocation** section, assign initial quantities specifically to *"John's Retail Store"*.
  - Select an active Supplier and save.
- **Verify**: The product immediately appears in the catalog table with accurate stock status chips (*In Stock* / *Low Stock*).
- Click the **pencil edit icon (✏️)** on any product to modify pricing or safety stock thresholds.

#### 4. Low-Stock Alerts & Smart Reorder Engine
- Click **"Low Stocks"** in the sidebar.
- Observe items whose current inventory count has fallen below the configured minimum threshold.
- Inspect the urgency severity indicators (*Critical* vs. *Low Stock*).
- Click **"Reorder"** next to an item:
  - **Verify**: The system pre-fills the suggested reorder quantity and opens the Purchase Order creation workflow targeting the product's assigned supplier.

#### 5. Physical Stock Adjustments & Shrinkage Reconciliation
- Click **"Stock Adjustment"** from the sidebar.
- Select a product and target store branch.
- Choose an adjustment reason code (*Damaged in Transit*, *Shrinkage / Theft*, *Expired Stock*, or *Physical Audit Reconciliation*).
- Enter quantity adjustment (+/- units) and add audit remarks.
- Click **"Submit Adjustment"**.
- **Verify**: The adjustment entry is appended to the audit log table with timestamp and reason, and the product's live stock count is updated immediately.

#### 6. Purchase Order Lifecycle & Supplier Catalog Browsing
- Click **"Purchase Orders"** in the sidebar.
- Click **"+ Create Purchase Order"**:
  - Select an active supplier (e.g., *"Apex Electronics"*).
  - Select destination store.
  - Click **"Browse Supplier Catalogue"**: The modal displays products offered by that supplier. Select items and input quantities.
  - Review computed subtotals, GST breakdown, and estimated delivery dates.
  - Click **"Submit PO"**.
- **Verify**: The PO appears in the Purchase Order list with status `Pending`.
- Once marked `Received` (upon vendor fulfillment), verify that the stock units automatically increment in the store's inventory.

#### 7. Biller (POS Staff) Management & Approval Gateway
- Click **"Billers"** in the sidebar.
- Review existing active cashiers (e.g., `jones@gmail.com`).
- Check the **"Pending Biller Requests"** section:
  - A pending application (e.g., `biller1@gmail.com`) is displayed.
  - Assign the target store branch (`JOHN-S-STORE`) and click **"Approve"**.
  - **Verify**: The applicant is granted active biller credentials and can log into the POS terminal.

#### 8. Supplier Directory & Performance Scorecards
- Click **"Suppliers"** in the sidebar.
- Review supplier profiles, payment terms (Net 30/60), and contact information.
- Click **"View Performance"** on any vendor:
  - **Verify**: The supplier performance scorecard displays fulfillment accuracy, on-time delivery percentages, defect rates, and historical PO track records.

#### 9. Customer Management & Returns (RMA) Processing
- Click **"Customers"** to view registered customer directory, purchase history, and lifetime expenditure.
- Click **"Returns"** to review RMA return claims filed by customers or returns to suppliers. Approve restock or inspect damaged units.

#### 10. New Retailer Registration & Guided Onboarding Wizard
- Log out from John's account.
- From the Landing Page, click **"Sign Up"** and select **"Retailer"**.
- Register a new email account.
- **Verify**: Because the retailer profile is uninitialized, the system automatically routes the user into the **Retailer Setup Wizard**:
  - Step 1: Business Profile (Business Name, Trade License / GSTIN, Industry)
  - Step 2: Primary Store Branch Setup (Store Name, Code, Location, Contact)
  - Step 3: Initial Inventory & Supplier Preferences
  - Step 4: Plan Confirmation & Launch
- Complete the wizard to unlock the full retailer dashboard.

---

### Cashier POS & Omnichannel Reservation Test Flow

1. Log in as **Biller**: `jones@gmail.com` / `pass1234`.
2. Notice the POS terminal bound to `JOHN-S-STORE`.
3. Search products by name or enter barcode (e.g., `8901030000000`).
4. Add items to the cart and observe line-item calculations, taxes, and subtotal.
5. Click **"Pay & Print Bill"** to complete cash or digital tender:
   - Live inventory for `JOHN-S-STORE` is decremented in real-time.
   - An audited POS transaction is recorded.
6. Switch to the **Reservations** tab in the POS interface:
   - View customer in-store pickup reservations.
   - Fulfill or complete customer pickup reservations with one-click verification.

---

### Backend API Verification (Swagger)

1. Ensure the backend server is running (`npm run start:dev` in `backend/`).
2. Open **`http://localhost:3001/api/docs`** in your browser.
3. Test key REST endpoints:
   - `GET /api/products`: Retrieve catalog items with optional `retailerId` and `storeId` query parameters.
   - `GET /api/retailers`: Retrieve registered retailer profiles.
   - `GET /api/retailers/directory`: Public directory of retailer businesses and store branches.
   - `GET /api/stores`: Query store branches scoped by retailer.
   - `GET /api/billers/requests`: Inspect pending biller applications.
   - `POST /api/stock-adjustments`: Create an audited stock adjustment record.
   - `GET /api/purchase-orders`: Retrieve purchase orders.
   - `GET /api/platform-revenue`: Retrieve platform fee and commission metrics.

---

### Running Backend Unit & E2E Tests
To execute backend test suites:
```bash
cd backend
npm run test
```
