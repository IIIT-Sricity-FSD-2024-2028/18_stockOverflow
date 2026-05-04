# Stock Overflow - Front End

Stock Overflow is a modern, high-fidelity inventory management and retail logistics platform. This repository contains the complete front-end implementation, built with a focus on performance, accessibility, and premium aesthetics.

## 🚀 Overview

Stock Overflow provides a centralized command center for managing complex retail operations. It supports a multi-stakeholder ecosystem including Administrators, Retailers, Suppliers, and Consumers, all interacting through a seamless, unified interface.

## 🛠 Tech Stack

- **Core**: Semantic HTML5 & Modern JavaScript (ES6+)
- **Styling**: Vanilla CSS3 with Custom Properties (CSS Variables)
- **Data Persistence**: `localStorage` based data engine (browser-side persistence)
- **UI/UX**: Custom-built components, glassmorphism effects, and dynamic animations.

## 📂 Project Structure

- `/admin`: Administrative dashboard including user management, role permissions, and multi-store setup.
- `/Retailer module`: Specialized tools for inventory tracking, order management, and store-level analytics.
- `/supplier module`: Portal for managing supply chains, shipments, and inventory replenishment.
- `/customer module`: Consumer-facing interface for product browsing and order tracking.
- `/biller module`: Point-of-Sale (POS) and billing interface for retail staff.
- `/auth`: Secure login and registration flows.
- `/js`: Core application logic, authentication wrappers, and the `mockData.js` data engine.
- `/css`: Global design system and component-specific styles.

## ✨ Key Features

- **Multi-Store Support**: Ability for a single retailer to manage multiple physical store locations.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for different user types.
- **Dynamic Analytics**: Real-time simulation of sales, revenue, and stock levels.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.
- **Custom Branding**: Professional, high-fidelity UI following modern design trends.

## 🚦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   ```
2. **Open the application**:
   Simply open `front-end/index.html` in any modern web browser.
   *Note: Using a local server extension (like Live Server in VS Code) is recommended for the best experience.*

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@stockoverflow.com` | `pass1234` |
| **Retailer** | `john.smith@stockoverflow.com` | `pass1234` |
| **Supplier** | `sarah.j@stockoverflow.com` | `pass1234` |

---

## 💾 Local Data Engine

The application uses a simulated database stored in the browser's `localStorage`.
- To reset the system to its initial state, navigate to **Admin Settings > Danger Zone** and click **Reset Database**.
- Alternatively, you can run `DB.resetDB()` in the browser console.
