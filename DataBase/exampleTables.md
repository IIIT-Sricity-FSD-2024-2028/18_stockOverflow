# Database Tables Documentation

This document provides example records for each table in the database to illustrate how data is stored in the **Stock Overflow – Inventory Management System**.

---

# 1. User Management Module

## roles

**Purpose:** Defines system roles such as admin, retailer, supplier, and staff.

| role_id | role_name | description | created_at |
|------|------|------|------|
| 1 | admin | Full system access | 2026-02-01 09:00:00 |
| 2 | retailer | Manages products, inventory, and sales | 2026-02-01 09:05:00 |
| 3 | supplier | Handles fulfillment and delivery updates | 2026-02-01 09:10:00 |

---

## users

**Purpose:** Stores user identity, login, and profile information.

| user_id | full_name | email | phone | status | created_at |
|------|------|------|------|------|------|
| 1 | Admin User | admin@stockoverflow.com | 9000000001 | active | 2026-02-01 09:15:00 |
| 2 | Ravi Retailer | ravi@retailmart.com | 9000000002 | active | 2026-02-01 09:20:00 |
| 3 | Suresh Supplier | suresh@supplyhub.com | 9000000003 | active | 2026-02-01 09:25:00 |

---

## permissions

**Purpose:** Stores individual permissions for different modules.

| permission_id | permission_name | module_name | description |
|------|------|------|------|
| 1 | manage_users | User Management | Create, edit, and delete users |
| 2 | manage_inventory | Inventory | Add and update inventory |
| 3 | view_reports | Reports | Access analytics and reports |

---

## role_permissions

**Purpose:** Maps roles to permissions.

| role_permission_id | role_id | permission_id |
|------|------|------|
| 1 | 1 | 1 |
| 2 | 1 | 3 |
| 3 | 2 | 2 |

---

## user_roles

**Purpose:** Assigns roles to users.

| user_role_id | user_id | role_id | assigned_at |
|------|------|------|------|
| 1 | 1 | 1 | 2026-02-01 10:00:00 |
| 2 | 2 | 2 | 2026-02-01 10:05:00 |
| 3 | 3 | 3 | 2026-02-01 10:10:00 |

---

## audit_logs

**Purpose:** Stores important user and system activity logs.

| log_id | user_id | module_name | action_type | record_id | description | created_at |
|------|------|------|------|------|------|------|
| 1 | 1 | User Management | CREATE | 2 | Admin created retailer account | 2026-02-01 10:15:00 |
| 2 | 2 | Inventory | UPDATE | 1 | Retailer updated stock quantity | 2026-02-05 11:30:00 |

---

# 2. Retailer and Store Management Module

## retailers

**Purpose:** Stores retailer business details.

| retailer_id | user_id | business_name | gst_number | address | created_at |
|------|------|------|------|------|------|
| 1 | 2 | RetailMart Pvt Ltd | GSTIN12345RM | Chennai, Tamil Nadu | 2026-02-01 10:20:00 |

---

## stores

**Purpose:** Stores retailer branch/store information.

| store_id | retailer_id | store_name | store_code | city | state | status |
|------|------|------|------|------|------|------|
| 1 | 1 | RetailMart Anna Nagar | RM-ANN-01 | Chennai | Tamil Nadu | active |
| 2 | 1 | RetailMart Velachery | RM-VEL-02 | Chennai | Tamil Nadu | active |

---

## warehouses

**Purpose:** Stores warehouse details for each store.

| warehouse_id | store_id | warehouse_name | warehouse_code | location | status |
|------|------|------|------|------|------|
| 1 | 1 | Anna Main Warehouse | WH-ANN-01 | Anna Nagar | active |
| 2 | 2 | Velachery Warehouse | WH-VEL-01 | Velachery | active |

---

# 3. Product Management Module

## categories

**Purpose:** Stores product categories.

| category_id | category_name | description | created_at |
|------|------|------|------|
| 1 | Electronics | Electronic products and accessories | 2026-02-02 09:00:00 |
| 2 | Groceries | Daily use grocery items | 2026-02-02 09:05:00 |

---

## subcategories

**Purpose:** Stores product subcategories under categories.

| subcategory_id | category_id | subcategory_name | description |
|------|------|------|------|
| 1 | 1 | Mobile Accessories | Chargers, cables, earphones |
| 2 | 2 | Beverages | Tea, coffee, juices |

---

## brands

**Purpose:** Stores product brands.

| brand_id | brand_name | description |
|------|------|------|
| 1 | Samsung | Consumer electronics brand |
| 2 | Tata Tea | Beverage brand |

---

## units

**Purpose:** Stores measurement units for products.

| unit_id | unit_name | short_name |
|------|------|------|
| 1 | Piece | pc |
| 2 | Box | bx |

---

## products

**Purpose:** Stores main product details.

| product_id | category_id | subcategory_id | brand_id | unit_id | product_name | slug | sku | item_code | barcode_symbology | selling_type | product_type |
|------|------|------|------|------|------|------|------|------|------|------|------|
| 1 | 1 | 1 | 1 | 1 | Samsung Charger 25W | samsung-charger-25w | SKU1001 | ITM1001 | Code128 | retail | single |
| 2 | 2 | 2 | 2 | 2 | Tata Tea Premium Pack | tata-tea-premium-pack | SKU1002 | ITM1002 | EAN13 | retail | single |

---

## product_images

**Purpose:** Stores product image paths.

| image_id | product_id | image_url | is_primary | uploaded_at |
|------|------|------|------|------|
| 1 | 1 | /images/products/charger.jpg | TRUE | 2026-02-02 11:00:00 |
| 2 | 2 | /images/products/tata-tea.jpg | TRUE | 2026-02-02 11:05:00 |

---

# 4. Inventory Management Module

## inventory

**Purpose:** Stores stock and pricing details for products at store/warehouse level.

| inventory_id | product_id | store_id | warehouse_id | quantity | price | tax_type | discount_type | discount_value | quantity_alert | status |
|------|------|------|------|------|------|------|------|------|------|------|
| 1 | 1 | 1 | 1 | 120 | 799.00 | GST 18% | percentage | 10.00 | 20 | in_stock |
| 2 | 2 | 2 | 2 | 35 | 550.00 | GST 5% | flat | 25.00 | 15 | low_stock |

---

## inventory_transactions

**Purpose:** Tracks every stock movement such as stock-in, sale, return, and transfer.

| transaction_id | inventory_id | transaction_type | quantity_changed | previous_quantity | new_quantity | reference_type | reference_id | created_by | created_at |
|------|------|------|------|------|------|------|------|------|------|
| 1 | 1 | stock_in | 50 | 70 | 120 | purchase_order | 1 | 2 | 2026-02-03 10:00:00 |
| 2 | 2 | sale | -5 | 40 | 35 | sale | 1 | 2 | 2026-02-03 11:00:00 |

---

## stock_adjustments

**Purpose:** Stores manual stock corrections.

| adjustment_id | inventory_id | adjusted_quantity | reason | adjusted_by | adjusted_at |
|------|------|------|------|------|------|
| 1 | 2 | -2 | Damaged stock removed | 2 | 2026-02-04 09:30:00 |

---

# 5. Customer and POS Module

## customers

**Purpose:** Stores customer details used in POS and returns.

| customer_id | full_name | email | phone | address | created_at |
|------|------|------|------|------|------|
| 1 | Priya Sharma | priya@gmail.com | 9876543210 | Chennai | 2026-02-03 12:00:00 |
| 2 | Arjun Kumar | arjun@gmail.com | 9123456780 | Chennai | 2026-02-03 12:10:00 |

---

## sales

**Purpose:** Stores POS sale header records.

| sale_id | customer_id | store_id | invoice_no | subtotal | discount_total | tax_total | grand_total | payment_method | payment_status | sold_by | sale_date |
|------|------|------|------|------|------|------|------|------|------|------|------|
| 1 | 1 | 1 | INV-2026-001 | 799.00 | 79.90 | 129.44 | 848.54 | UPI | paid | 2 | 2026-02-03 12:30:00 |
| 2 | 2 | 2 | INV-2026-002 | 1100.00 | 25.00 | 53.75 | 1128.75 | Cash | paid | 2 | 2026-02-03 13:00:00 |

---

## sale_items

**Purpose:** Stores product line items in each sale.

| sale_item_id | sale_id | product_id | quantity | unit_price | discount_amount | tax_amount | total_price |
|------|------|------|------|------|------|------|------|
| 1 | 1 | 1 | 1 | 799.00 | 79.90 | 129.44 | 848.54 |
| 2 | 2 | 2 | 2 | 550.00 | 25.00 | 53.75 | 1128.75 |

---

## returns

**Purpose:** Stores return transactions.

| return_id | sale_id | customer_id | return_reason | return_status | returned_by | return_date |
|------|------|------|------|------|------|------|
| 1 | 1 | 1 | Defective charger | approved | 2 | 2026-02-05 14:00:00 |

---

## return_items

**Purpose:** Stores returned products for each return.

| return_item_id | return_id | product_id | quantity | refund_amount |
|------|------|------|------|------|
| 1 | 1 | 1 | 1 | 848.54 |

---

## product_feedback

**Purpose:** Stores customer product ratings and feedback.

| feedback_id | product_id | customer_id | rating | feedback_text | created_at |
|------|------|------|------|------|------|
| 1 | 1 | 1 | 4 | Fast charging and good quality | 2026-02-05 15:00:00 |
| 2 | 2 | 2 | 5 | Good taste and fresh pack | 2026-02-05 15:10:00 |

---

## restock_requests

**Purpose:** Stores customer requests for restock alerts.

| request_id | product_id | customer_id | store_id | request_status | requested_at |
|------|------|------|------|------|------|
| 1 | 2 | 1 | 2 | pending | 2026-02-06 10:00:00 |

---

# 6. Supplier and Purchase Module

## suppliers

**Purpose:** Stores supplier details.

| supplier_id | user_id | supplier_name | contact_person | email | phone | city | status | created_at |
|------|------|------|------|------|------|------|------|------|
| 1 | 3 | SupplyHub Distributors | Suresh Kumar | suresh@supplyhub.com | 9000000003 | Chennai | active | 2026-02-02 10:00:00 |

---

## purchase_orders

**Purpose:** Stores purchase order headers raised to suppliers.

| purchase_order_id | supplier_id | store_id | po_number | order_date | expected_delivery_date | total_amount | fulfillment_status | payment_status | created_by |
|------|------|------|------|------|------|------|------|------|------|
| 1 | 1 | 1 | PO-2026-001 | 2026-02-03 | 2026-02-07 | 25000.00 | pending | unpaid | 2 |
| 2 | 1 | 2 | PO-2026-002 | 2026-02-04 | 2026-02-08 | 18000.00 | partial | partial | 2 |

---

## purchase_order_items

**Purpose:** Stores product-level details inside purchase orders.

| po_item_id | purchase_order_id | product_id | quantity_ordered | unit_cost | total_cost |
|------|------|------|------|------|------|
| 1 | 1 | 1 | 50 | 500.00 | 25000.00 |
| 2 | 2 | 2 | 40 | 450.00 | 18000.00 |

---

## deliveries

**Purpose:** Stores delivery tracking information for purchase orders.

| delivery_id | purchase_order_id | delivery_status | dispatch_date | delivery_date | carrier_name | tracking_number | received_by |
|------|------|------|------|------|------|------|------|
| 1 | 1 | delivered | 2026-02-05 | 2026-02-07 | BlueDart | TRK10001 | 2 |
| 2 | 2 | shipped | 2026-02-06 | NULL | Delhivery | TRK10002 | NULL |

---

# 7. System Configuration Module

## system_settings

**Purpose:** Stores configurable system settings.

| setting_id | setting_key | setting_value | setting_group | updated_by | updated_at |
|------|------|------|------|------|------|
| 1 | default_tax_rate | 18 | taxation | 1 | 2026-02-01 16:00:00 |
| 2 | low_stock_threshold | 10 | inventory | 1 | 2026-02-01 16:05:00 |
| 3 | enable_restock_alerts | true | notifications | 1 | 2026-02-01 16:10:00 |

---

# 8. Relationship Reference Summary

## Core Relationship Examples

| Table | Foreign Key | References |
|------|------|------|
| user_roles | user_id | users.user_id |
| user_roles | role_id | roles.role_id |
| role_permissions | role_id | roles.role_id |
| role_permissions | permission_id | permissions.permission_id |
| retailers | user_id | users.user_id |
| stores | retailer_id | retailers.retailer_id |
| warehouses | store_id | stores.store_id |
| subcategories | category_id | categories.category_id |
| products | category_id | categories.category_id |
| products | subcategory_id | subcategories.subcategory_id |
| products | brand_id | brands.brand_id |
| products | unit_id | units.unit_id |
| product_images | product_id | products.product_id |
| inventory | product_id | products.product_id |
| inventory | store_id | stores.store_id |
| inventory | warehouse_id | warehouses.warehouse_id |
| inventory_transactions | inventory_id | inventory.inventory_id |
| inventory_transactions | created_by | users.user_id |
| stock_adjustments | inventory_id | inventory.inventory_id |
| stock_adjustments | adjusted_by | users.user_id |
| sales | customer_id | customers.customer_id |
| sales | store_id | stores.store_id |
| sales | sold_by | users.user_id |
| sale_items | sale_id | sales.sale_id |
| sale_items | product_id | products.product_id |
| returns | sale_id | sales.sale_id |
| returns | customer_id | customers.customer_id |
| returns | returned_by | users.user_id |
| return_items | return_id | returns.return_id |
| return_items | product_id | products.product_id |
| suppliers | user_id | users.user_id |
| purchase_orders | supplier_id | suppliers.supplier_id |
| purchase_orders | store_id | stores.store_id |
| purchase_orders | created_by | users.user_id |
| purchase_order_items | purchase_order_id | purchase_orders.purchase_order_id |
| purchase_order_items | product_id | products.product_id |
| deliveries | purchase_order_id | purchase_orders.purchase_order_id |
| deliveries | received_by | users.user_id |
| product_feedback | product_id | products.product_id |
| product_feedback | customer_id | customers.customer_id |
| restock_requests | product_id | products.product_id |
| restock_requests | customer_id | customers.customer_id |
| restock_requests | store_id | stores.store_id |
| system_settings | updated_by | users.user_id |
| audit_logs | user_id | users.user_id |

---

# 9. Notes

- The records shown above are **sample records** only.
- These examples are meant to explain **how data is stored** in the database.
- Actual production data will vary depending on system usage.
- Some fields such as passwords and image paths are simplified for documentation purposes.
