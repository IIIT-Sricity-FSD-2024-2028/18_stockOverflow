# AI Agent Prompt: Stock Overflow Feature Implementation & Fixes

**Context:**
You are working on "Stock Overflow," a Vanilla HTML/CSS/JS frontend application with a NestJS backend (using JSON files for persistence). The frontend communicates with the backend via a custom `IMS_HTTP.request` wrapper located in `frontend/js/api-config.js`. Alternatively, it may use local `localStorage` mock data if the backend is unavailable. 

**Goal:**
Implement the following bug fixes and new features related to user flows, purchasing, and the retailer/supplier relationship. Please ensure you do not break the existing Vanilla CSS design or the custom Vanilla JS architecture.

Please execute the following 8 tasks. Work step-by-step and verify the connections between the frontend modules and backend endpoints.

---

### Task 1: Supplier Login & Initial Setup Redirection
- **Login Redirect:** In `frontend/js/auth.js` (and any related login handlers), ensure that when a Supplier logs in, they are correctly redirected to `supplier-dashboard.html`.
- **Initial Setup Redirect:** In `frontend/supplier module/supplier-initial.html` (and its JS logic), change the form submission behavior. After the supplier successfully completes the initial setup details, redirect them to the **login page** (e.g., `frontend/auth/login.html`) instead of going directly to the dashboard.

### Task 2: Supplier Initial Setup Form Refactoring
- **Remove Retailer List:** In `supplier-initial.html`, completely remove the "retailer list" section (currently the second step).
- **Modify Flow:** After the "Profile" step, the form should immediately transition to the "Products" step.
- **Product Details:** Update the "Products" step to ask for proper product details, matching the fields used in the Supplier Product Catalog. **Remove the pricing part** from this initial setup step.
- **Data Sync:** Ensure that any products added during this initial setup are correctly saved to the backend (or local storage) and immediately reflected in the:
  - Supplier Dashboard
  - Supplier Product Catalog
  - Supplier Profile
- **Validation:** Implement proper form validation for all required fields in `supplier-initial.html` before allowing submission.

### Task 3: Retailer Initial Setup Form Refactoring
- **Remove Steps:** In `frontend/Retailer module/Retailer-intitial.html`, remove the "supplier list" step and the "products" step.
- **Modify Flow:** After completing the "Stores" step, transition directly to the "Review" section.
- **Redirect:** Upon successful submission of the Retailer Initial Setup form, redirect the retailer to the **login page**.

### Task 4: Biller Authentication & Store Allocation
- **Store Access:** Ensure a Biller can only view and interact with the specific store they were approved for.
- **Login Redirect:** When a Biller logs in, redirect them specifically to their allocated store's POS interface.
- **Transaction Sync:** When a Biller confirms/accepts an order from a consumer in the POS, ensure this action records a new Transaction in the system.

### Task 5: Consumer Post-Purchase Flow & Retailer Sync
- **Purchase Trigger:** Once the Biller confirms the product, it must be officially marked as "purchased" by the Consumer.
- **Post-Purchase Features:** Only *after* the purchase is confirmed should the Consumer be allowed to:
  - Write a review for the product.
  - Initiate a return for the product.
- **Retailer Sync:** The purchase must reflect in the Retailer module. Specifically:
  - The Consumer should be added to the Retailer's "Customers/Consumers" section.
  - The changes (revenue, sales, inventory deduction) must be shown on the Retailer Dashboard.

### Task 6: Returns Management & Reviews
- **Consumer Module:** Ensure the Returns Management UI and the Review submission logic work properly in the Consumer module.
- **Retailer Module:** Ensure the Retailer has a functional Returns Management section where they can view, approve, or reject the returns initiated by consumers.

### Task 7: Retailer Profile Modal/Dropdown
- **Top Bar Avatar:** In the Retailer module (e.g., `Retialer_Dashboard.html` and other retailer pages), make the avatar in the top right of the top bar clickable.
- **Profile Details:** Clicking the avatar should display the Retailer's profile details (e.g., as a dropdown, modal, or off-canvas menu). Create the UI and bind the data accordingly.

### Task 8: Retailer-Supplier Purchase Order (PO) Integration
This is a critical integration between Retailers and Suppliers regarding Purchase Orders (POs).
- **PO History:** In the Retailer module's "Suppliers List" section, when the retailer is creating a PO, add a new section that displays the history of previous POs with that supplier.
- **Dynamic Product Fetching:** While creating a PO, when adding products, dynamically fetch the available product catalog from the selected Supplier and display them for selection.
- **Supplier PO Statuses:** In the Supplier module's "Purchases/Orders" section, implement four strict status states for each PO:
  1. `Confirm` (when it is in pending status)
  2. `In Delivery` (when it is in accepted status)
  3. `Delivered` (when it is in delivery status)
  4. `Cancelled`
- **Retailer Feedback on PO:** Allow the Retailer to submit feedback on a PO *only after* it has been marked as `Delivered` by the Supplier. This should be done from the PO history section.
- **Feedback Visibility:** The feedback given by the Retailer should be visible in two places:
  1. Retailer module: In the Supplier list when clicking the "view" icon for that supplier.
  2. Supplier module: Visible to the supplier on their dashboard/profile.
- **Overall Connection:** Ensure all API endpoints or `localStorage` bindings between Retailers, Suppliers, and Purchase Orders are fully functional and error-free.

---

**Execution Instructions:**
- Verify your changes using the `api-config.js` wrapper and the Network tab if running locally.
- Do not introduce React or other frameworks. Stick to Vanilla JavaScript and the existing CSS system.
- Read through the backend controllers (e.g., `ProductsController`, `PurchaseOrdersController`) to understand the parameters required for these integrations.
