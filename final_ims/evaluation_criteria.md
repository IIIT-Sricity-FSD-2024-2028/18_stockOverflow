# 📦 Review–4 Requirements

## 1. Backend Development (Mandatory)
- Backend must be developed using **NestJS**
- Follow proper modular architecture:
  - Modules
  - Controllers
  - Services

---

## 2. In-Memory Data Management
- No external database is required
- Use **in-memory data structures**:
  - Arrays
  - Objects
- Data structures must reflect the **ER Diagram**
- CRUD operations must be fully functional:
  - Create
  - Read
  - Update
  - Delete

---

## 3. Role-Based Access Control (RBAC)
- Implement **authorization using roles**
- Authentication is **not required**
- Roles must be passed through the **API request header**
- Use **Guards / Middleware (NestJS)** to enforce access control

---

## 4. REST API Development
- Implement proper RESTful APIs:
  - `GET`
  - `POST`
  - `PUT` / `PATCH`
  - `DELETE`
- APIs must align with **frontend modules**
- Maintain **consistent request and response formats**

---

## 5. Validation and Error Handling
- Use **DTOs (Data Transfer Objects)** for validation
- Handle:
  - Invalid inputs
  - Missing data
  - Edge cases
- Return appropriate **HTTP status codes**

---

## 6. Frontend–Backend Integration
- Replace all **mock data** (used in Review–3) with backend API calls
- Ensure seamless integration between frontend and backend
- All CRUD operations must be **backend-driven**

---

## 7. API Documentation
- Use **Swagger** for API documentation
- Documentation must include for each API:
  - Request body schema
  - Response schema
  - Header (role) description
- Export Swagger JSON to:
/back-end/docs/swagger.json

---

## 8. Code Structure and Best Practices
- Maintain clean and modular code
- Proper separation of concerns:
- Controller
- Service
- Module
- Ensure readability and maintainability

---

# 🎥 Submission Guidelines

## 📌 Video Demonstration (Max: 10 Minutes)

### 1. ER Diagram Explanation (1 Minute)
- Overview of entities and relationships

---

### 2. JIRA Project Tracking (1 Minute)
- Presented by Team Leader
- Show:
- Sprint planning (last 2 months)
- Task allocation
- Completion timelines

---

### 3. Workflow Demonstration (5 Minutes)
- Demonstrate **8–10 workflows**
- Cover all user roles

---

### 4. Backend Code Walkthrough (2 Minutes)
- Explain:
- Modules
- Controllers
- Services
- Dependencies among modules

---

### 5. DTOs and Swagger Documentation (1 Minute)
- Explain DTO usage
- Demonstrate Swagger for at least **5 APIs**
- Request
- Response
- Role-based access

---

# 📁 Project Folder Structure
root/
├── front-end/
├── back-end/
│ ├── docs/
│ │ └── swagger.json
├── Videos/
│ └── <team-video>.mp4