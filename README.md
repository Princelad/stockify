
# 📦 Stockify

<div align="center">

![GitHub repo](https://img.shields.io/github/stars/Princelad/stockify?style=social&label=Star)
![MIT License](https://img.shields.io/badge/license-MIT-green)
![GitHub issues](https://img.shields.io/github/issues/Princelad/stockify)
![GitHub forks](https://img.shields.io/github/forks/Princelad/stockify)
![GitHub release](https://img.shields.io/github/v/release/Princelad/stockify)

- 🐛 **Bug Reports:** Found a bug? [Create an issue](https://github.com/Princelad/stockify/issues/new?template=bug_report.md)
- ✨ **Feature Requests:** Have an idea? [Suggest a feature](https://github.com/Princelad/stockify/issues/new?template=feature_request.md)

**An open-source stock management and billing solution for small and medium-sized businesses**

*Streamline your business operations with essential inventory tracking, billing, and customer management features*

[🚀 Quick Start](#-quick-start) • [🎯 Project Scope](#-project-scope) • [✨ Features](#️-features) • [🛣️ Roadmap](#️-roadmap) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Project Scope

Stockify is designed as a **minimal but comprehensive** open-source solution for stock management and billing, specifically tailored for small and medium-sized businesses. While the system includes multiple feature types, it focuses on essential functionality rather than being a fully-fledged enterprise system.

### Core Purpose
Help shopkeepers and business owners efficiently manage their inventory and streamline billing processes by:
- **Stock Management:** Track product details and monitor goods coming in and out of shops
- **Integrated Billing:** Generate customer bills that automatically update stock levels
- **Business Insights:** Display trends and growth patterns to support business decisions
- **Customer Relations:** Manage customer purchase history and payment tracking

### Key Capabilities
- **Multi-tier Pricing:** Support both retail customers and wholesale dealers with different pricing structures
- **Payment Flexibility:** Accept multiple payment methods (UPI, Cash, Card, etc.)
- **Credit Management:** Track customer payment histories and set purchase permissions based on payment behavior
- **Catalog Management:** Bulk import product catalogs and easily update stock during deliveries
- **Order Management:** Reduce manual bookkeeping with digital order tracking
- **Multi-supplier Support:** Track same products from different suppliers while maintaining unified inventory

---


## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Princelad/stockify.git
cd stockify

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start MongoDB (if running locally)
mongod

# Start backend server (development mode)
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm start
```

### Docker Setup (Alternative)
```bash
# Using Docker Compose
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Default Admin Credentials
- **Email:** admin@stockify.com  
- **Password:** admin123

> ⚠️ **Important:** Change the default admin credentials after first login!

---


## ✨ Features

### 👥 User Management
- **Role-based Access Control:** Admin and Staff roles with granular permissions
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing
- **User Activity Tracking:** Monitor user actions and login history

### 📦 Stock Management
- **Product Catalog:** Comprehensive product management with categories and variants
- **Multi-supplier Tracking:** Same products from different suppliers with unified inventory view
- **Stock Levels:** Real-time inventory tracking with automatic updates during sales
- **Bulk Import:** Import complete product catalogs from suppliers
- **Goods Tracking:** Monitor products coming in and going out of the shop
- **Delivery Integration:** Easy stock updates during goods delivery

### 💰 Billing & Sales
- **Integrated Billing:** Automatic stock deduction when generating customer bills
- **Multi-tier Pricing:** Different prices for retail customers and wholesale dealers
- **Multiple Payment Methods:** Support for UPI, Cash, Card, and other payment options
- **Invoice Generation:** Professional bill generation with business details
- **Customer Purchase History:** Track all customer transactions and payment records

### 📊 Business Analytics
- **Growth Trends:** Visual representation of business growth and performance
- **Sales Reports:** Track sales patterns and identify popular products
- **Stock Movement:** Monitor inventory turnover and movement patterns
- **Customer Insights:** Analyze customer behavior and purchase patterns

### 👤 Customer & Dealer Management
- **Customer Profiles:** Detailed customer information and purchase history
- **Payment History:** Track customer payments and outstanding amounts
- **Credit Control:** Set purchase permissions based on payment behavior
- **Loyalty Discounts:** Reward frequent customers with automatic discounts
- **Dealer Support:** Separate pricing and management for wholesale dealers

### 🔧 Business Operations
- **Order Management:** Digital order tracking to reduce manual bookkeeping
- **Supplier Management:** Track multiple suppliers for the same products
- **Payment Tracking:** Monitor customer payment histories and creditworthiness
- **Stock Alerts:** Notifications for low stock and reorder requirements


---


## 🧰 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with bcrypt
- **Validation:** Joi schema validation
- **File Upload:** Multer for image handling
- **Email:** Nodemailer for notifications
- **Testing:** Jest and Supertest

### Frontend
- **Framework:** React.js 18+ with hooks
- **Styling:** Tailwind CSS for responsive design
- **Charts:** Chart.js and Recharts for analytics
- **Forms:** React Hook Form with validation
- **State Management:** Context API and React Query
- **Icons:** React Icons and Heroicons
- **PDF Generation:** jsPDF and react-pdf

### Utilities & Integrations
- **QR Codes:** react-qr-code and qrcode libraries
- **PDF Generation:** PDFKit for server-side PDF creation
- **Date Handling:** Day.js for date manipulation
- **HTTP Client:** Axios for API communication
- **Development:** Nodemon, Concurrently for dev workflow

### DevOps & Deployment
- **Containerization:** Docker and Docker Compose
- **Process Management:** PM2 for production
- **Environment:** dotenv for configuration
- **CORS:** cors middleware for cross-origin requests


---



## 📁 Project Structure

```text
/stockify
├── backend/                    # Server-side application
│   ├── controllers/           # Business logic handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   └── userController.js
│   ├── models/               # Database schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   └── Customer.js
│   ├── routes/               # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── sales.js
│   │   └── users.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/               # Utility functions
│   │   ├── generatePDF.js
│   │   ├── sendEmail.js
│   │   └── helpers.js
│   ├── config/              # Configuration files
│   │   └── database.js
│   ├── tests/               # Test files
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── index.js            # Server entry point
├── frontend/                 # Client-side application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Shared components
│   │   │   ├── forms/       # Form components
│   │   │   └── charts/      # Chart components
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Sales.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/        # API service functions
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── productService.js
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   └── useLocalStorage.js
│   │   ├── context/         # React context providers
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml        # Docker configuration
├── .gitignore
├── LICENSE
└── README.md
```


---


## 🛣️ Roadmap & Project Status

### 📢 Current State (July 2025)

- The project is now initialized with minimal boilerplate for both backend (Express) and frontend (React).
- You can start the backend and frontend servers using the instructions in their respective `README.md` files.
- The structure is ready for further development of features as outlined below.

### 🗺️ Next Steps

1. **Backend Development:**
   - Expand the Express backend with API endpoints, models, and business logic.
   - Add authentication, database integration, and other planned features.
2. **Frontend Development:**
   - Build out the React frontend with pages, components, and API integration.
   - Implement UI for inventory, billing, analytics, and user management.
3. **Documentation:**
   - Continue updating the README and subfolder READMEs as features are added.

### �️ Development Roadmap

#### Phase 1: Core Foundation (Current)
- [x] Project initialization with Express backend and React frontend
- [x] Basic project structure and documentation
- [ ] Database schema design for products, customers, and sales
- [ ] User authentication and authorization system
- [ ] Basic product management (CRUD operations)

#### Phase 2: Stock Management
- [ ] Product catalog with multi-supplier support
- [ ] Stock tracking and inventory updates
- [ ] Bulk product import functionality
- [ ] Goods in/out tracking system
- [ ] Stock level monitoring and alerts

#### Phase 3: Billing System
- [ ] Integrated billing with automatic stock deduction
- [ ] Multi-tier pricing (retail vs wholesale)
- [ ] Multiple payment method support
- [ ] Invoice generation and printing
- [ ] Sales transaction recording

#### Phase 4: Customer Management
- [ ] Customer profile management
- [ ] Payment history tracking
- [ ] Credit control and purchase permissions
- [ ] Loyalty discount system
- [ ] Dealer management with separate pricing

#### Phase 5: Business Analytics
- [ ] Sales trend analysis and reporting
- [ ] Growth tracking and visualization
- [ ] Customer behavior analytics
- [ ] Stock movement reports
- [ ] Business performance dashboard

#### Phase 6: Advanced Features
- [ ] Order management system
- [ ] Multi-supplier product tracking
- [ ] Advanced reporting and insights
- [ ] Mobile-responsive interface improvements
- [ ] Export/import functionality for data migration

---

## 📱 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Dashboard+Coming+Soon)

### Inventory Management
![Inventory](https://via.placeholder.com/800x400/059669/FFFFFF?text=Inventory+Coming+Soon)

### Sales & Billing
![Sales](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Sales+Coming+Soon)

</div>

---

## 🚀 Getting Started Guide

### For Business Owners
1. **Setup:** Follow the [Quick Start](#-quick-start) guide
2. **Configuration:** Set up your business details, tax rates, and user accounts
3. **Catalog:** Import your product catalog or add products manually with supplier details
4. **Customers:** Set up customer profiles and dealer accounts with appropriate pricing
5. **Operations:** Start processing sales with integrated stock management and billing
6. **Analytics:** Monitor business growth trends and customer patterns

### For Shopkeepers
1. **Product Management:** Easily add products from multiple suppliers to your catalog
2. **Stock Tracking:** Monitor goods coming in during deliveries and going out during sales
3. **Billing:** Generate bills that automatically update your stock levels
4. **Customer Relations:** Track customer payment histories and manage credit limits
5. **Order Management:** Reduce manual bookkeeping with digital order tracking
6. **Business Insights:** View trends and growth to make informed business decisions

### For Developers
1. **Fork** the repository and clone your fork
2. **Setup** the development environment following our [contribution guide](#-contributing)
3. **Explore** the codebase and review our [coding standards](CONTRIBUTING.md)
4. **Pick** an issue from our [GitHub Issues](https://github.com/Princelad/stockify/issues)
5. **Contribute** by submitting a pull request

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### Ways to Contribute
- � **Bug Reports:** Found a bug? [Create an issue](https://github.com/your-org/stockify/issues/new?template=bug_report.md)
- ✨ **Feature Requests:** Have an idea? [Suggest a feature](https://github.com/your-org/stockify/issues/new?template=feature_request.md)
- 📖 **Documentation:** Improve our docs, add tutorials, or fix typos
- 🧪 **Testing:** Write tests, improve test coverage, or test new features
- 💻 **Code:** Implement new features, fix bugs, or improve performance

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/Princelad/stockify.git
cd stockify

# Install dependencies
npm run install:all

# Set up pre-commit hooks
npm run prepare

# Run tests
npm test

# Start development servers
npm run dev
```

### Contribution Guidelines
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Check existing [issues](https://github.com/Princelad/stockify/issues) before creating new ones
- Follow conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)
- Write tests for new features and bug fixes
- Update documentation for API changes
- Ensure all tests pass before submitting PR

### Recognition
Contributors will be featured in our [Contributors Hall of Fame](CONTRIBUTORS.md) and receive special badges based on their contributions.

---

## 📖 Documentation

- [📘 API Documentation](docs/API.md) - Complete REST API reference
- [🔧 Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [🎯 User Manual](docs/USER_GUIDE.md) - End-user documentation
- [🧪 Testing Guide](docs/TESTING.md) - How to run and write tests
- [🚀 Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [🤝 Contributing Guidelines](CONTRIBUTING.md) - Developer contribution guide

---

## 🌟 Community & Support

### Get Help
- 📚 [Documentation](https://stockify-docs.com) - Comprehensive guides and API docs
- 💬 [Discord Community](https://discord.gg/stockify) - Chat with users and developers
- 🐛 [GitHub Issues](https://github.com/Princelad/stockify/issues) - Bug reports and feature requests
- 📧 [Email Support](mailto:support@stockify.com) - Direct support for critical issues

### Stay Updated
- ⭐ **Star** this repository to show support
- 👀 **Watch** for updates and new releases
- 🐦 **Follow** us on [Twitter](https://twitter.com/stockifyapp)
- 📝 **Subscribe** to our [Blog](https://blog.stockify.com) for updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-party Licenses
This project uses several open-source packages. See [LICENSES.md](LICENSES.md) for a complete list of third-party licenses.

---

## 🙏 Acknowledgments

- Thanks to all [contributors](CONTRIBUTORS.md) who have helped build Stockify
- Inspired by modern inventory management needs of small businesses
- Built with ❤️ by the open-source community

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the Stockify community

</div>
