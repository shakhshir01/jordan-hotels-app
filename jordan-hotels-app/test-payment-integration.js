import { hotelAPI } from './src/services/api.js';

// Test payment intent creation
async function testPaymentIntent() {
  console.log('🧪 Testing payment intent creation...');

  try {
    const result = await hotelAPI.createPaymentIntent({
      amount: 10000, // 100 JOD in cents
      currency: 'jod',
      metadata: {
        experienceId: 'test-experience',
        customerEmail: 'test@example.com'
      }
    });

    console.log('✅ Payment intent created:', result);

    // Check if it's a mock payment intent
    if (result.clientSecret && result.clientSecret.startsWith('pi_mock_')) {
      console.log('✅ Mock payment intent detected - payments working in development mode!');
    } else {
      console.log('ℹ️ Real payment intent created');
    }

    return result;
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error.message);
    throw error;
  }
}

// Test experience retrieval
async function testExperienceRetrieval() {
  console.log('🧪 Testing experience retrieval...');

  try {
    const experience = await hotelAPI.getExperienceById('e-petra-night');
    console.log('✅ Experience retrieved:', experience?.title);
    return experience;
  } catch (error) {
    console.error('❌ Experience retrieval failed:', error.message);
    throw error;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting payment integration tests...\n');

  try {
    await testExperienceRetrieval();
    console.log('');
    await testPaymentIntent();
    console.log('\n🎉 All tests passed! Payment integration is working.');
  } catch (error) {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  }
}

runTests();