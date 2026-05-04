# Stock Overflow – Inventory Management System

## 1. Project Overview

**Stock Overflow** is a modern **Inventory Lifecycle Management System** designed for retail ecosystems. It provides a centralized platform for managing inventory, coordinating supply chains, and delivering real-time analytics across multiple stakeholders.

The system integrates **Retailers, Suppliers, Consumers, Billers (POS), and Administrators** into a unified environment to streamline operations, improve visibility, and enable data-driven decisions.

---

## 2. Problem Statement

Retail stores and small businesses often face significant challenges in managing inventory efficiently, leading to operational inefficiencies and revenue loss.

### Key Problems

- Lack of real-time product stock tracking across multiple stores  
- Manual inventory updates causing human errors  
- No automated low-stock alerts or reorder workflows  
- Limited supplier performance visibility  
- Difficulty analyzing sales trends and forecasting demand  
- Poor tracking of returns and stock adjustments  
- No centralized monitoring system  

These issues result in inaccurate stock data, delayed restocking, weak supplier coordination, and poor customer satisfaction.

---

## 3. Proposed Solution

Stock Overflow provides a **centralized digital ecosystem** where:

- Retailers manage inventory and analytics  
- Suppliers handle order fulfillment and deliveries  
- Consumers check availability and give feedback  
- Billers manage POS transactions  
- Administrators control system-wide operations  

---

## 4. Core Features

### Inventory & Operations
- Real-time inventory tracking  
- Multi-store inventory management  
- Stock transfers between stores  
- Inventory transaction tracking  
- Product return and adjustment management  

### Supply Chain
- Purchase order management  
- Supplier performance monitoring  
- Delivery tracking and status updates  

### Analytics & Intelligence
- Demand forecasting  
- Sales and inventory analytics  
- Smart low-stock alerts  
- Audit logs and reporting  

### Customer Interaction
- Product availability checking  
- Product feedback and ratings  

### System Management
- Role-based access control (RBAC)  
- Multi-store setup and configuration  
- Centralized dashboards  

---

## 5. Technology Stack

### Frontend
- HTML5, CSS3 (Vanilla, no frameworks)  
- JavaScript (ES6+)  
- Custom design system (CSS variables, animations, glassmorphism UI)

### Backend
- NestJS (TypeScript)  
- Modular architecture (Controller, Service, Module, DTO)

### Data Persistence
- JSON-based storage (`backend/data/*.json`)  
- LocalStorage fallback for frontend mock data  

---

## 6. System Architecture

### Backend (`backend/src/`)

Follows **modular NestJS architecture**:

#### Core Modules
- `users` – Authentication & RBAC  
- `retailers`, `suppliers`, `customers`, `billers` – Actor modules  
- `stores`, `warehouses` – Location management  
- `products` – Catalog, feedback, ratings  

#### Inventory Lifecycle Modules
- `inventory`  
- `transactions`  
- `stock-adjustments`  
- `purchase-orders`  
- `returns`  
- `reservations`  

These modules handle the **complete lifecycle of stock movement**.

---

### Frontend (`frontend/`)

Organized by user roles:

- `admin/` – Dashboard, users, system setup  
- `retailer/` – Inventory & analytics tools  
- `supplier/` – Order and delivery management  
- `customer/` – Product browsing & feedback  
- `biller/` – POS and billing system  
- `auth/` – Login & authentication  
- `js/` – Core logic (`IMS_HTTP.request`)  
- `css/` – Design system  

---

## 7. Identified Actors

| Actor | Description |
|------|-------------|
| **Retailer** | Manages inventory, stores, analytics |
| **Supplier** | Handles product supply and deliveries |
| **Consumer** | Checks availability and gives feedback |
| **Biller (POS)** | Handles billing and sales transactions |
| **System Administrator** | Controls system configuration and monitoring |

---

## 8. Features by Actor

### 8.1 Retailer

- Inventory management and tracking  
- Multi-store management  
- Inventory analysis and reporting  
- Product returns handling  
- Demand forecasting  

---

### 8.2 Supplier

- Purchase order handling  
- Delivery updates and confirmations  
- Supplier performance tracking  

---

### 8.3 Consumer

- Product availability checking  
- Product feedback and reviews  

---

### 8.4 Biller (POS)

- Billing and sales processing  
- Real-time stock deduction  
- Integration with inventory system  

---

### 8.5 System Administrator

- User and role management (RBAC)  
- Multi-store configuration  
- System settings and rules  
- Global analytics dashboard  

---

## 9. Key Domain Concepts

- Inventory Item  
- Stock Quantity  
- Purchase Order  
- Inventory Transactions  
- Supplier Performance  
- Product Return  
- Audit Logs  
- Multi-Store Inventory  
- Demand Forecasting  
- Product Feedback  
- POS Synchronization  

---

## 10. Core System Capabilities

- **Multi-Store Support**: Scoped using `storeId` and `retailerId`  
- **RBAC**: Fine-grained permissions  
- **Real-Time Simulation**: Inventory, revenue, and analytics  
- **Smart Alerts**: Low stock and performance insights  
- **High-Fidelity UI**: Modern UX with animations and responsiveness  

---

## 11. Implementation Guide

### Frontend Rules

1. Use `IMS_HTTP.request()` for API calls  
2. No frameworks (React, Angular, etc.)  
3. Use only Vanilla CSS (no Tailwind)  
4. Follow existing design system  
5. Handle backend failures using localStorage mock data  

---

### Backend Rules

1. Follow NestJS structure (Controller, Service, Module, DTO)  
2. Persist data using JSON files (`fs` module)  
3. Enforce multi-tenancy (`storeId`, `retailerId`)  
4. Use DTO validation (`class-validator`)  

---

### Feature Development Workflow

#### Backend
- Create DTOs  
- Implement Controller  
- Build Service logic  
- Register module  

#### Frontend
- Add UI (HTML + CSS)  
- Implement JS logic  
- Integrate API using `IMS_HTTP.request`  

---

## 12. Expected Impact

- Improved inventory accuracy  
- Reduced stockouts and overstock  
- Better supplier coordination  
- Enhanced customer satisfaction  
- Data-driven decision-making  
- Automated retail workflows  

---

## 13. Future Scope

- AI-based demand forecasting  
- Advanced analytics dashboards  
- Real-time POS & external API integrations  
- Mobile application  
- Barcode/RFID integration  
- E-commerce integration  
- Supplier recommendation system  
