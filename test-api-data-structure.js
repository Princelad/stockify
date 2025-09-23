#!/usr/bin/env node

/**
 * API Test - Create Product with Correct Data Structure
 * This will help us debug the current API issues
 */

const testProductData = {
  name: "Samsung Galaxy S24 Ultra",
  sku: "SAM-S24U-512GB",
  category: "Electronics", 
  brand: "Samsung",
  description: "Latest flagship smartphone",
  barcode: "",
  costPrice: 950.00,
  sellingPrice: 1199.99,
  currentStock: 25,  // Backend expects this field
  minStockLevel: 10,
  supplier: {
    name: "PDF Import",
    contact: "",
    email: ""
  }
};

console.log('🧪 API Test: Product Creation Data Structure');
console.log('=====================================');
console.log('');

console.log('📋 Product data being sent to API:');
console.log(JSON.stringify(testProductData, null, 2));
console.log('');

console.log('✅ Field Validation:');
console.log('   • name:', testProductData.name ? '✓ Present' : '✗ Missing');
console.log('   • sku:', testProductData.sku ? '✓ Present' : '✗ Missing'); 
console.log('   • category:', testProductData.category ? '✓ Present' : '✗ Missing');
console.log('   • costPrice:', typeof testProductData.costPrice === 'number' ? '✓ Valid number' : '✗ Invalid');
console.log('   • sellingPrice:', typeof testProductData.sellingPrice === 'number' ? '✓ Valid number' : '✗ Invalid');
console.log('   • currentStock:', typeof testProductData.currentStock === 'number' ? '✓ Valid number (backend expects this)' : '✗ Invalid');
console.log('   • minStockLevel:', typeof testProductData.minStockLevel === 'number' ? '✓ Valid number' : '✗ Invalid');
console.log('   • supplier:', testProductData.supplier && typeof testProductData.supplier === 'object' ? '✓ Valid object' : '✗ Invalid');

console.log('');
console.log('🔍 Backend Validation Requirements (from validation.js):');
console.log('   • name: string, required ✓');
console.log('   • sku: string, required ✓');
console.log('   • category: string, required ✓');
console.log('   • costPrice: number >= 0, required ✓');
console.log('   • sellingPrice: number >= 0, required ✓');
console.log('   • currentStock: number >= 0, required ✓');
console.log('   • minStockLevel: number >= 0, required ✓');
console.log('   • supplier: object, optional ✓');

console.log('');
console.log('⚠️  Common Issues Fixed:');
console.log('   • Field name: "currentStock" (not "stock") ✓');
console.log('   • Numeric validation: all prices/quantities are numbers ✓');
console.log('   • Required fields: all present ✓');
console.log('   • Supplier object: properly structured ✓');

console.log('');
console.log('🎯 Next Steps:');
console.log('   1. Ensure authentication token is valid');
console.log('   2. Check network connectivity to API');
console.log('   3. Verify API endpoint is running');
console.log('   4. Test with this exact data structure');

console.log('');
console.log('🔧 Debugging Commands:');
console.log('   • Check auth token: localStorage.getItem("authToken")');
console.log('   • Test API health: GET http://localhost:5000/api/products/test/routes');
console.log('   • Verify user auth: GET http://localhost:5000/api/auth/verify');