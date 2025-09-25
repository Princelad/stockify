# Database Seeding Scripts

This directory contains scripts for managing and seeding the Stockify database with sample data.

## Files Overview

### `seedDatabase.js`

Main seeding script that populates the database with comprehensive sample data including:

- **Users** (3 users with different roles: admin, manager, staff)
- **Categories** (10 default categories for products)
- **Suppliers** (3 sample suppliers with complete information)
- **Customers** (4 sample customers including dealers)
- **Products** (6 diverse products with realistic data)
- **Sales** (2 sample sales transactions)

### `seed.js`

Interactive seeding script with CLI options and help system.

### `dbUtils.js`

Database utility script for maintenance and monitoring.

## Quick Start

### Basic Seeding

```bash
# Full database seed (recommended for development)
npm run seed

# Seed with detailed logging
npm run seed:dev
```

### Database Management

```bash
# Check database statistics
npm run db:stats

# Clear all data (with confirmation)
npm run db:clear -- --confirm

# Validate data integrity
npm run db:validate

# Show recent activity
npm run db:activity
```

## Sample Data Details

### Users Created

| Role    | Email                | Password   | Features                |
| ------- | -------------------- | ---------- | ----------------------- |
| Admin   | admin@stockify.com   | admin123   | Full system access      |
| Manager | manager@stockify.com | manager123 | Management capabilities |
| Staff   | staff@stockify.com   | staff123   | Basic operations        |

### Products Created

- **iPhone 15 Pro** ($999) - Electronics, 25 in stock
- **Samsung Galaxy S24** ($899) - Electronics, 30 in stock
- **Nike Air Max 270** ($150) - Sports & Outdoors, 50 in stock
- **Adidas Ultraboost 22** ($180) - Sports & Outdoors, 35 in stock
- **Coffee Maker Deluxe** ($249) - Home & Garden, 15 in stock
- **Wireless Bluetooth Headphones** ($199) - Electronics, 40 in stock

### Categories Created

- Electronics (popular)
- Clothing (popular)
- Home & Garden
- Sports & Outdoors (popular)
- Books & Media
- Beauty & Personal Care (popular)
- Automotive
- Food & Beverages (popular)
- Health & Wellness
- Toys & Games (popular)

### Suppliers Created

- **TechWorld Supplies** - Electronics supplier from San Francisco
- **Fashion Forward Inc** - Clothing supplier from New York
- **HomeGoods Direct** - Home & Garden supplier from Chicago

## Environment Requirements

Make sure you have the following environment variables set in your `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## Data Features

### Multi-Tier Pricing

Products include both retail and wholesale pricing:

- Regular customers get `sellingPrice`
- Dealers get `wholesalePrice`

### Realistic Business Logic

- Stock levels are tracked and updated with sales
- Invoice numbers are auto-generated
- Categories maintain product counts
- Sales history is recorded
- Suppliers have complete business information

### User Isolation

All data is properly scoped to users via `createdBy` fields for multi-tenant support.

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure MongoDB is running and `MONGO_URI` is correct
2. **Permission Errors**: Make sure database user has read/write permissions
3. **Duplicate Key Errors**: Run `npm run db:clear -- --confirm` first

### Validation

The seeding script includes validation to ensure:

- Unique SKUs for products
- Valid email formats
- Proper reference relationships
- Stock level consistency

## Development Tips

### Testing Different Scenarios

```bash
# Start fresh for testing
npm run db:clear -- --confirm && npm run seed

# Check what was created
npm run db:stats

# Monitor recent activity
npm run db:activity
```

### Customizing Sample Data

Edit the sample data arrays in `seedDatabase.js`:

- `sampleUsers` - Modify user accounts
- `sampleCategories` - Add/modify categories
- `sampleSuppliers` - Update supplier information
- `createSampleProducts()` - Customize product catalog

### Production Considerations

- Never run seeding scripts on production databases
- Always backup before clearing data
- Use appropriate environment variables
- Consider data privacy requirements

## Script Details

### Database Operations

- Clears existing data before seeding (optional)
- Creates proper relationships between models
- Updates calculated fields (stock, totals, counts)
- Validates data integrity after seeding

### Error Handling

- Comprehensive error logging
- Graceful failure handling
- Process exit codes for CI/CD
- Connection cleanup

### Performance

- Batch operations for efficiency
- Proper indexing utilization
- Memory-conscious data loading
- Connection pooling respect
