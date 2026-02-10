# Domain Expert Interaction Report  
## Inventory Management System (IMS)

---

## Summary of the Interaction

---

## Basic Information

- **Domain:** Retail Inventory & Operations
- **Problem Statement:** Inventory & Stock Lifecycle Management Platform
- **Date of Interaction:** 30 January 2026  
- **Mode of Interaction:** Audio Call  
- **Duration (in minutes):** 22 minutes  
- **Publicly Accessible Video/Audio Link:** https://drive.google.com/file/d/10mgzXTk0hm9WqGFAfTT2c6r4qsUl4lZH/view?usp=sharing

---

## Domain Expert Details

- **Role / Designation:** Retail Inventory & Supply Chain Operations Professional  
- **Experience in the Domain:**  
  The domain expert has more than **8 years of experience** in retail inventory management and supply chain coordination. Their responsibilities include monitoring stock availability, handling procurement and supplier coordination, ensuring timely replenishment of products, managing warehouse and store-level inventory, handling POS-based stock updates, tracking product movement, and preparing inventory audit reports.  

- **Nature of Work:** Administrative and Operational  

---

## Domain Context and Terminology

---

### Overall Purpose of the Problem Statement

The overall purpose of the **Inventory Management System (IMS)** is to provide a centralized platform that can monitor and control the complete stock lifecycle from procurement to sale while ensuring real-time inventory visibility, accurate POS synchronization, efficient supplier coordination, and improved decision-making through analytics and reporting.

---

### Primary Goals / Outcomes

- Real-time visibility of product stock levels  
- Reduction of stockouts and overstocking situations  
- Accurate synchronization between POS sales and inventory records  
- Efficient coordination between retailers and suppliers  
- Intelligent reorder recommendations based on demand trends  
- Multi-store centralized inventory management  
- Proper audit logging of all inventory movements and updates  

---

### Key Domain Terms and Meanings

| Term | Meaning as explained by the expert |
|------|----------------------------------|
| Inventory Level | Quantity of products available in a store at a particular time |
| Stock Movement | Tracking stock changes from procurement, transfers, sales, and returns |
| Stockout | A condition where product quantity becomes zero and cannot be sold |
| Reorder Point | Minimum threshold quantity at which replenishment must be initiated |
| Demand Forecasting | Predicting future sales using historical POS and inventory trends |
| POS Synchronization | Automatic updating of inventory based on sales transactions from POS |
| Supplier Fulfillment | Supplier confirming and delivering products against retailer orders |
| Audit Log | System record that tracks all inventory updates for accountability |

---

## Actors and Responsibilities

| Actor / Role | Responsibilities |
|--------------|------------------|
| Retailer | Manage product catalog, monitor inventory levels, approve reorders, track stock lifecycle, manage multi-store inventory |
| Supplier | Confirm fulfillment, update delivery status, manage schedules, maintain supply reliability |
| Consumer | Check product availability, request restock alerts, provide feedback |
| Admin | Control global configurations, manage user roles, generate system-wide reports |
| POS System (External) | Sends sales transactions and updates inventory in real time |

---

## Core Workflows

---

### Workflow 1: Inventory Procurement and Stock Entry

- **Trigger / Start Condition:** Stock level reaches reorder point OR retailer identifies shortage  
- **Steps Involved:**  
  1. Retailer places a purchase order to supplier  
  2. Supplier reviews and confirms order availability  
  3. Supplier dispatches shipment and updates delivery status  
  4. Retailer receives stock and confirms inward entry  
  5. IMS updates inventory quantity in the database  
  6. Product becomes available for sale in the store system  

- **Outcome / End Condition:** Stock is successfully added and updated in IMS  

---

### Workflow 2: POS Sales Synchronization

- **Trigger / Start Condition:** Consumer purchases product using POS system  
- **Steps Involved:**  
  1. Consumer buys product at retail store  
  2. POS system records transaction and generates billing  
  3. POS sends sales data to IMS using integration API  
  4. IMS automatically reduces product stock quantity  
  5. Updated stock level is reflected in real time for retailer and admin dashboards  

- **Outcome / End Condition:** Inventory remains consistent between POS and IMS  

---

### Workflow 3: Intelligent Reorder Recommendation and Demand Forecasting

- **Trigger / Start Condition:** IMS detects reorder threshold or trend-based shortage prediction  
- **Steps Involved:**  
  1. IMS monitors current inventory levels continuously  
  2. System checks reorder point threshold for each product  
  3. IMS analyzes historical sales trends and stock consumption rate  
  4. System generates reorder quantity recommendation  
  5. Retailer reviews suggestion and confirms reorder request  
  6. Supplier receives the order request for fulfillment  

- **Outcome / End Condition:** Reorder process initiated with intelligent quantity recommendation  

---

### Workflow 4: Multi-Store Inventory Monitoring

- **Trigger / Start Condition:** Retailer or admin requests branch-level inventory visibility  
- **Steps Involved:**  
  1. Retailer selects store branch from dashboard  
  2. IMS displays store-wise product stock levels  
  3. System highlights low-stock and fast-moving products  
  4. Retailer decides whether to reorder or transfer stock between stores  
  5. IMS updates inventory distribution records accordingly  

- **Outcome / End Condition:** Improved stock balancing and visibility across multiple stores  

---

### Workflow 5: Inventory Audit and Reporting

- **Trigger / Start Condition:** Periodic audit requirement or suspicious stock mismatch detected  
- **Steps Involved:**  
  1. IMS maintains audit logs of all stock movements  
  2. Admin generates system-wide audit and analytics reports  
  3. Reports highlight mismatches between sales and stock  
  4. Retailer verifies inventory physically and updates corrections if needed  
  5. Final audit summary is stored for accountability and compliance  

- **Outcome / End Condition:** Inventory transparency and audit verification completed  

---

## Rules, Constraints, and Exceptions

---

### Mandatory Rules or Policies

- POS sales data must update IMS inventory automatically  
- Every inventory update must be recorded in an audit log  
- Only authorized users can modify stock quantities and product details  
- Reorder suggestions must be generated using demand trends and sales history  
- Multi-store inventory data must remain consistent across branches  

---

### Constraints or Limitations

- POS integration depends on third-party API availability  
- Real-time inventory updates require stable network connectivity  
- Multi-store systems require consistent synchronization to avoid stock mismatches  
- Supplier delivery delays may affect stock availability even if reorder is initiated  

---

### Common Exceptions or Edge Cases

- POS system downtime causing delayed inventory updates  
- Manual stock adjustments due to damaged or expired products  
- Returned products requiring stock correction and validation  
- Emergency replenishment needed for high-demand products  
- Duplicate product entries due to inconsistent catalog management  

---

### Situations Where Things Usually Go Wrong

- POS data mismatch resulting in incorrect stock quantity  
- Supplier delays leading to frequent stockouts  
- Overstocking due to inaccurate forecasting  
- Missing audit logs causing accountability issues  
- Multiple stores ordering separately leading to poor inventory distribution  

---

## Current Challenges and Pain Points

- Lack of real-time visibility of stock across branches  
- Manual dependency for supplier follow-up and delivery confirmation  
- Difficulty identifying fast-moving and slow-moving products  
- Frequent mismatch between physical stock and system records  
- Lack of centralized multi-store monitoring in many retail setups  
- Limited automation in reorder and forecasting decisions  

---

## Assumptions and Clarifications

---

### Assumptions Confirmed

- POS integration is essential for real-time inventory tracking  
- Retailers require centralized monitoring for multi-store operations  
- Supplier delivery performance directly impacts stock availability  
- Demand forecasting improves reorder decisions and reduces overstocking  

---

### Assumptions Corrected

- Consumers do not have the ability to modify stock or reorder products  
- Suppliers only manage fulfillment and delivery status, not inventory ownership  
- Admin controls global system policies and configurations but does not handle daily stock operations  

---
