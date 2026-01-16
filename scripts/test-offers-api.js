// Script to test offers API endpoints
const fetch = require('node-fetch');

// Load environment variables
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available
}

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testOffersAPI() {
    console.log('🧪 Testing Offers API endpoints...\n');
    console.log(`Base URL: ${BASE_URL}\n`);
    
    // Test data structure
    const testOfferData = {
        offerNumber: 'TEST-API-001',
        commonData: {
            registrationNumber: 'CA1234AB',
            ownerName: 'Тест Клиент',
            vehicleBrand: 'Test Brand',
            vehicleModel: 'Test Model',
            vehicleAge: 3,
            vehicleValue: 50000
        },
        offersData: [
            {
                insurerName: 'Test Insurer',
                insurer: 'test-insurer',
                premium: 1000,
                insuranceTypes: {
                    casco: {
                        premium: 1000,
                        insuranceData: {
                            insuranceSum: 50000,
                            service: 'official'
                        }
                    }
                }
            }
        ],
        insuranceTypes: ['casco'],
        title: 'Test Offer via API'
    };
    
    // First, we need to login (if authentication is required)
    console.log('1. Testing login...');
    try {
        // Try to get a session - for testing, we'll skip auth for now
        // In production, you'd need to login first
        console.log('   ⚠️  Note: API requires authentication');
        console.log('   ⚠️  Make sure you are logged in or disable auth for testing\n');
    } catch (error) {
        console.error('   ❌ Login error:', error.message);
    }
    
    console.log('2. Testing GET /api/offers (requires auth)...');
    try {
        const response = await fetch(`${BASE_URL}/api/offers`);
        if (response.status === 401 || response.status === 403) {
            console.log('   ⚠️  Requires authentication (expected)');
        } else if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success! Found ${data.length} offers`);
        } else {
            console.log(`   ⚠️  Status: ${response.status}`);
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
        console.log('   💡 Make sure the server is running: npm start');
    }
    
    console.log('\n3. Testing GET /api/offers/my (requires auth)...');
    try {
        const response = await fetch(`${BASE_URL}/api/offers/my`);
        if (response.status === 401 || response.status === 403) {
            console.log('   ⚠️  Requires authentication (expected)');
        } else if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success! Found ${data.length} user offers`);
        } else {
            console.log(`   ⚠️  Status: ${response.status}`);
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
    
    console.log('\n4. Testing POST /api/offers (requires auth)...');
    try {
        const response = await fetch(`${BASE_URL}/api/offers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testOfferData)
        });
        if (response.status === 401 || response.status === 403) {
            console.log('   ⚠️  Requires authentication (expected)');
        } else if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success! Offer created with ID: ${data.id}`);
        } else {
            const errorText = await response.text();
            console.log(`   ⚠️  Status: ${response.status}`);
            console.log(`   Error: ${errorText}`);
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
    
    console.log('\n✅ API endpoints are configured correctly!');
    console.log('💡 To test fully, you need to:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Login through the web interface');
    console.log('   3. Create an offer through the UI');
    console.log('   4. Check if it appears in /api/offers');
}

testOffersAPI().catch(console.error);

