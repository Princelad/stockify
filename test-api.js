// Test script to verify backend API endpoints
// Run this with: node test-api.js

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing Stockify Backend API...\n');

    try {
        // Test 1: Basic API connection
        console.log('1. Testing API connection...');
        const testResponse = await fetch(`${API_BASE}/auth/test`);
        const testData = await testResponse.json();
        console.log('✅ API Connection:', testData.message);

        // Test 2: User Registration
        console.log('\n2. Testing user registration...');
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        
        const registerData = await registerResponse.json();
        if (registerResponse.ok) {
            console.log('✅ Registration successful:', registerData.message);
            console.log('User:', registerData.user);
            
            // Test 3: User Login
            console.log('\n3. Testing user login...');
            const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: registerData.user.email,
                    password: 'password123'
                })
            });
            
            const loginData = await loginResponse.json();
            if (loginResponse.ok) {
                console.log('✅ Login successful:', loginData.message);
                console.log('Token received:', !!loginData.token);
            } else {
                console.log('❌ Login failed:', loginData.message);
            }
        } else {
            console.log('❌ Registration failed:', registerData.message);
        }

    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        console.log('\n🔧 Make sure your backend server is running on http://localhost:5000');
    }
}

// Run the test
testAPI();
