
# 📦 Stockify

<div align="center">

![GitHub repo](https://img.shields.io/github/stars/Princelad/stockify?style=social)
![MIT License](https://img.shields.io/badge/license-MIT-green)
![GitHub issues](https://img.shields.io/github/issues/Princelad/stockify)
![GitHub forks](https://img.shields.io/github/forks/Princelad/stockify)
![GitHub release](https://img.shields.io/github/v/release/Princelad/stockify)

- 🐛 **Bug Reports:** Found a bug? [Create an issue](https://github.com/Princelad/stockify/issues/new?template=bug_report.md)
- ✨ **Feature Requests:** Have an idea? [Suggest a feature](https://github.com/Princelad/stockify/issues/new?template=feature_request.md)

**A modern, open-source inventory and billing management system designed for small and medium businesses**

*Streamline your business operations with powerful analytics, automated workflows, and growth-oriented tools*

[🚀 Quick Start](#-quick-start) • [✨ Features](#️-features) • [🛣️ Roadmap](#️-roadmap) • [🤝 Contributing](#-contributing)

</div>

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

### 📦 Inventory Management
- **Product Catalog:** Comprehensive product management with categories and variants
- **QR Code Integration:** Generate and scan QR codes for quick product identification
- **Expiry Date Tracking:** Monitor product expiration dates with automated alerts
- **GST/HSN Support:** Tax compliance with GST and HSN code management
- **Stock Levels:** Real-time inventory tracking with low-stock notifications
- **Batch Management:** Track product batches and manufacturing dates

### 💰 Billing & Sales
- **Fast Checkout:** Streamlined billing process with barcode scanning
- **Tax Calculations:** Automatic tax computation with multiple tax rates
- **Discounts & Offers:** Flexible discount system (percentage, fixed amount, buy-one-get-one)
- **Multiple Payment Methods:** Cash, card, UPI, and digital wallet support
- **Invoice Generation:** Professional PDF invoices with print functionality
- **Return Management:** Handle returns and refunds efficiently

### 📊 Analytics & Reporting
- **Sales Analytics:** Comprehensive sales reports with time-based filtering
- **Inventory Reports:** Stock movement, valuation, and turnover analysis
- **Profit/Loss Tracking:** Real-time P&L statements and margin analysis
- **Customer Insights:** Purchase history and behavior analytics
- **Dashboard Widgets:** Customizable dashboard with key metrics

### 👤 Customer Management
- **Customer Profiles:** Detailed customer information and purchase history
- **Loyalty Programs:** Points-based reward system to encourage repeat business
- **Communication:** Email and SMS invoice delivery (optional integration)
- **Credit Management:** Track customer credit limits and outstanding amounts

### 🔧 Business Tools
- **Data Import/Export:** CSV and Excel support for bulk operations
- **Backup & Restore:** Automated database backups with restore functionality
- **Multi-location Support:** Manage multiple store locations from single dashboard
- **Offline Mode:** Continue operations during internet connectivity issues


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

### 🚧 Planned Roadmap (To Be Updated As You Build)

- [ ] Backend API and authentication (Express, MongoDB)
- [ ] Frontend UI and dashboard (React, Tailwind CSS)
- [ ] Inventory and billing modules
- [ ] Analytics and reporting
- [ ] User management
- [ ] Testing and CI/CD setup
- [ ] Docker and deployment scripts

*Expand this roadmap as your project evolves!*

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
3. **Inventory:** Import your existing product catalog or add products manually
4. **Training:** Use the built-in demo data to familiarize yourself with features
5. **Go Live:** Start processing real transactions and track your business growth

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
