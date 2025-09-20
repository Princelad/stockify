#!/usr/bin/env node

/**
 * Test script to verify Profile functionality
 * This script tests the profile system without running the full application
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Stockify Profile System\n');

// Test 1: Check if all required files exist
console.log('📁 Checking file structure...');

const requiredFiles = [
  'frontend/src/pages/Profile.tsx',
  'frontend/src/lib/api.ts',
  'backend/routes/users.js',
  'backend/models/User.js',
  'backend/index.js'
];

const missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Test 2: Check if upload directories exist
console.log('\n📂 Checking upload directories...');

const requiredDirs = [
  'backend/uploads',
  'backend/uploads/avatars',
  'backend/uploads/pdfs'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING (will be auto-created)`);
  }
});

// Test 3: Check API service methods
console.log('\n🔍 Analyzing API Service...');

try {
  const apiContent = fs.readFileSync('frontend/src/lib/api.ts', 'utf8');
  
  const requiredMethods = [
    'getUserProfile',
    'updateUserProfile', 
    'uploadAvatar',
    'getUserStats',
    'getUserActivity',
    'getUserPreferences',
    'updateUserPreferences',
    'changePassword',
    'exportUserData'
  ];

  const foundMethods = [];
  const missingMethods = [];

  requiredMethods.forEach(method => {
    if (apiContent.includes(`async ${method}`)) {
      foundMethods.push(method);
      console.log(`✅ ${method}()`);
    } else {
      missingMethods.push(method);
      console.log(`❌ ${method}() - MISSING`);
    }
  });

  console.log(`\n📊 API Methods: ${foundMethods.length}/${requiredMethods.length} found`);

} catch (error) {
  console.log('❌ Could not read API service file');
}

// Test 4: Check backend routes
console.log('\n🛤️  Analyzing Backend Routes...');

try {
  const routesContent = fs.readFileSync('backend/routes/users.js', 'utf8');
  
  const requiredRoutes = [
    "router.get('/profile'",
    "router.put('/profile'", 
    "router.post('/avatar'",
    "router.get('/stats'",
    "router.get('/activity'",
    "router.get('/preferences'",
    "router.put('/preferences'",
    "router.post('/change-password'",
    "router.get('/export'"
  ];

  const foundRoutes = [];
  const missingRoutes = [];

  requiredRoutes.forEach(route => {
    if (routesContent.includes(route)) {
      foundRoutes.push(route);
      console.log(`✅ ${route}`);
    } else {
      missingRoutes.push(route);
      console.log(`❌ ${route} - MISSING`);
    }
  });

  console.log(`\n📊 Backend Routes: ${foundRoutes.length}/${requiredRoutes.length} found`);

} catch (error) {
  console.log('❌ Could not read backend routes file');
}

// Test 5: Check User model
console.log('\n👤 Analyzing User Model...');

try {
  const userModelContent = fs.readFileSync('backend/models/User.js', 'utf8');
  
  const requiredFields = ['name', 'email', 'password', 'phone', 'bio', 'avatar', 'role', 'preferences'];
  
  requiredFields.forEach(field => {
    if (userModelContent.includes(field)) {
      console.log(`✅ ${field} field`);
    } else {
      console.log(`❌ ${field} field - MISSING`);
    }
  });

} catch (error) {
  console.log('❌ Could not read User model file');
}

// Summary
console.log('\n📋 TEST SUMMARY');
console.log('================');

if (missingFiles.length === 0) {
  console.log('✅ All required files present');
} else {
  console.log(`❌ Missing files: ${missingFiles.length}`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

console.log('\n🚀 To start the application:');
console.log('   npm run start:dev');
console.log('\n📖 Profile features available:');
console.log('   • User profile management');
console.log('   • Avatar upload');
console.log('   • Statistics dashboard');
console.log('   • Activity tracking');
console.log('   • User preferences');
console.log('   • Password change');
console.log('   • Data export');

console.log('\n🔗 Profile URL: http://localhost:5173/profile');
console.log('🔗 API Base: http://localhost:5000/api/users');