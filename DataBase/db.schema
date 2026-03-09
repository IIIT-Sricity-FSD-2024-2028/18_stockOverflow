CREATE DATABASE IF NOT EXISTS stock_overflow_ims;
USE stock_overflow_ims;

CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(100),
    description TEXT
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    status ENUM('active','inactive','blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    UNIQUE(role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
);

CREATE TABLE user_roles (
    user_role_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE retailers (
    retailer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    gst_number VARCHAR(50) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE stores (
    store_id INT PRIMARY KEY AUTO_INCREMENT,
    retailer_id INT NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    store_code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (retailer_id) REFERENCES retailers(retailer_id)
);

CREATE TABLE warehouses (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    warehouse_code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(150),
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subcategories (
    subcategory_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    subcategory_name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(category_id, subcategory_name),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE brands (
    brand_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE units (
    unit_id INT PRIMARY KEY AUTO_INCREMENT,
    unit_name VARCHAR(50) NOT NULL UNIQUE,
    short_name VARCHAR(20)
);

CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    subcategory_id INT,
    brand_id INT,
    unit_id INT,
    product_name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    item_code VARCHAR(100) NOT NULL UNIQUE,
    barcode_symbology VARCHAR(50),
    selling_type ENUM('retail','wholesale') DEFAULT 'retail',
    product_type ENUM('single','variable') DEFAULT 'single',
    description TEXT,
    manufacturer VARCHAR(150),
    manufacture_date DATE,
    expiry_date DATE,
    warranty_period VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(subcategory_id),
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    FOREIGN KEY (unit_id) REFERENCES units(unit_id)
);

CREATE TABLE product_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    store_id INT NOT NULL,
    warehouse_id INT,
    quantity INT NOT NULL DEFAULT 0 CHECK(quantity >= 0),
    price DECIMAL(10,2) NOT NULL CHECK(price >= 0),
    tax_type VARCHAR(50),
    discount_type ENUM('flat','percentage','none') DEFAULT 'none',
    discount_value DECIMAL(10,2) DEFAULT 0 CHECK(discount_value >= 0),
    quantity_alert INT DEFAULT 0 CHECK(quantity_alert >= 0),
    status ENUM('in_stock','low_stock','out_of_stock') DEFAULT 'in_stock',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(product_id, store_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    purchase_order_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    store_id INT NOT NULL,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    total_amount DECIMAL(10,2) DEFAULT 0 CHECK(total_amount >= 0),
    fulfillment_status ENUM('pending','partial','fulfilled','cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE purchase_order_items (
    po_item_id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_ordered INT NOT NULL CHECK(quantity_ordered > 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK(unit_cost >= 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK(total_cost >= 0),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE deliveries (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INT NOT NULL,
    delivery_status ENUM('processing','shipped','delivered','delayed') DEFAULT 'processing',
    dispatch_date DATE,
    delivery_date DATE,
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    received_by INT,
    notes TEXT,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id),
    FOREIGN KEY (received_by) REFERENCES users(user_id)
);

CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    store_id INT NOT NULL,
    invoice_no VARCHAR(100) NOT NULL UNIQUE,
    subtotal DECIMAL(10,2) NOT NULL CHECK(subtotal >= 0),
    discount_total DECIMAL(10,2) DEFAULT 0 CHECK(discount_total >= 0),
    tax_total DECIMAL(10,2) DEFAULT 0 CHECK(tax_total >= 0),
    grand_total DECIMAL(10,2) NOT NULL CHECK(grand_total >= 0),
    payment_method VARCHAR(50),
    payment_status ENUM('paid','pending','failed') DEFAULT 'pending',
    sold_by INT NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (sold_by) REFERENCES users(user_id)
);

CREATE TABLE sale_items (
    sale_item_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK(quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK(unit_price >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK(discount_amount >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK(tax_amount >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK(total_price >= 0),
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE returns (
    return_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    customer_id INT,
    return_reason TEXT,
    return_status ENUM('requested','approved','rejected','completed') DEFAULT 'requested',
    returned_by INT NOT NULL,
    return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (returned_by) REFERENCES users(user_id)
);

CREATE TABLE return_items (
    return_item_id INT PRIMARY KEY AUTO_INCREMENT,
    return_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK(quantity > 0),
    refund_amount DECIMAL(10,2) DEFAULT 0 CHECK(refund_amount >= 0),
    FOREIGN KEY (return_id) REFERENCES returns(return_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE inventory_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    transaction_type ENUM('stock_in','sale','return','adjustment','transfer') NOT NULL,
    quantity_changed INT NOT NULL,
    previous_quantity INT NOT NULL CHECK(previous_quantity >= 0),
    new_quantity INT NOT NULL CHECK(new_quantity >= 0),
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE stock_adjustments (
    adjustment_id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    adjusted_quantity INT NOT NULL,
    reason TEXT NOT NULL,
    adjusted_by INT NOT NULL,
    adjusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (adjusted_by) REFERENCES users(user_id)
);

CREATE TABLE product_feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE restock_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    store_id INT NOT NULL,
    request_status ENUM('pending','notified','closed') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(100),
    updated_by INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    module_name VARCHAR(100),
    action_type VARCHAR(100) NOT NULL,
    record_id INT,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
