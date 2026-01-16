// Script to test offers queries
const { Pool } = require('pg');

// Load environment variables
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
}

async function testOffersQueries() {
    try {
        console.log('🔍 Testing offers queries...\n');
        
        const offersQueries = require('../db/offers-queries');
        
        // Test 1: Check if table exists
        console.log('1. Checking if offers table exists...');
        const pool = require('../db/connection').pool;
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'offers'
            );
        `);
        if (tableCheck.rows[0].exists) {
            console.log('   ✅ Offers table exists\n');
        } else {
            console.log('   ❌ Offers table does not exist!\n');
            console.log('   💡 Run: node scripts/create-offers-table.js\n');
            process.exit(1);
        }
        
        // Test 2: Check if we have users (needed for testing)
        console.log('2. Checking users...');
        const usersCheck = await pool.query('SELECT id, username FROM users LIMIT 1');
        if (usersCheck.rows.length === 0) {
            console.log('   ⚠️  No users found - cannot test create offer');
            console.log('   💡 Create a user first: node scripts/create-admin.js\n');
        } else {
            const testUserId = usersCheck.rows[0].id;
            const testUsername = usersCheck.rows[0].username;
            console.log(`   ✅ Found user: ${testUsername} (ID: ${testUserId})\n`);
            
            // Test 3: Create a test offer
            console.log('3. Testing createOffer...');
            const testOfferData = {
                offerNumber: 'TEST-001',
                commonData: {
                    registrationNumber: 'CA1234AB',
                    ownerName: 'Тест Клиент',
                    vehicleBrand: 'Test Brand',
                    vehicleModel: 'Test Model'
                },
                offersData: [
                    {
                        insurerName: 'Test Insurer',
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
                title: 'Test Offer'
            };
            
            try {
                const createdOffer = await offersQueries.createOffer(testUserId, testOfferData);
                console.log(`   ✅ Offer created successfully! (ID: ${createdOffer.id})\n`);
                
                // Test 4: Get offer by ID
                console.log('4. Testing getOfferById...');
                const retrievedOffer = await offersQueries.getOfferById(createdOffer.id);
                if (retrievedOffer && retrievedOffer.id === createdOffer.id) {
                    console.log(`   ✅ Offer retrieved successfully! (ID: ${retrievedOffer.id})\n`);
                } else {
                    console.log('   ❌ Failed to retrieve offer\n');
                }
                
                // Test 5: Get user offers
                console.log('5. Testing getUserOffers...');
                const userOffers = await offersQueries.getUserOffers(testUserId);
                if (userOffers.length > 0) {
                    console.log(`   ✅ Found ${userOffers.length} offer(s) for user\n`);
                } else {
                    console.log('   ❌ No offers found for user\n');
                }
                
                // Test 6: Get all offers
                console.log('6. Testing getAllOffers...');
                const allOffers = await offersQueries.getAllOffers(10);
                console.log(`   ✅ Found ${allOffers.length} total offer(s)\n`);
                
                // Test 7: Update offer
                console.log('7. Testing updateOffer...');
                const updatedData = {
                    ...testOfferData,
                    title: 'Updated Test Offer'
                };
                const updatedOffer = await offersQueries.updateOffer(createdOffer.id, testUserId, updatedData);
                if (updatedOffer && updatedOffer.title === 'Updated Test Offer') {
                    console.log(`   ✅ Offer updated successfully! (ID: ${updatedOffer.id})\n`);
                } else {
                    console.log('   ❌ Failed to update offer\n');
                }
                
                // Test 8: Delete offer
                console.log('8. Testing deleteOffer...');
                const deleted = await offersQueries.deleteOffer(createdOffer.id, testUserId);
                if (deleted) {
                    console.log('   ✅ Offer deleted successfully!\n');
                } else {
                    console.log('   ❌ Failed to delete offer\n');
                }
                
            } catch (error) {
                console.error('   ❌ Error:', error.message);
                console.error(error.stack);
            }
        }
        
        console.log('✅ All tests completed!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testOffersQueries();

