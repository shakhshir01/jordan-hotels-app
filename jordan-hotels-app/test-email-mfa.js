import axios from 'axios';

const testEmailMFA = async () => {
  const apiUrl = 'https://lk8nfjc7m1.execute-api.us-east-1.amazonaws.com/prod';

  console.log('🔍 Testing Email MFA functionality...');
  console.log(`API URL: ${apiUrl}`);

  try {
    // Test 1: Test user profile endpoint (should work without auth for basic info)
    console.log('\n📋 Test 1: GET /user/profile (unauthenticated)');
    try {
      const profileResponse = await axios.get(`${apiUrl}/user/profile`);
      console.log('✅ User profile endpoint accessible:', profileResponse.status);
    } catch (error) {
      console.log('ℹ️  User profile requires authentication (expected):', error.response?.status);
    }

    // Test 2: Test blog endpoint (should work)
    console.log('\n📋 Test 2: GET /blog');
    const blogResponse = await axios.get(`${apiUrl}/blog`);
    console.log('✅ Blog endpoint working:', blogResponse.status, blogResponse.data?.length || 'N/A', 'posts');

    console.log('\n✅ Basic API connectivity confirmed!');
    console.log('ℹ️  Note: Email MFA testing requires authentication. Test manually through the frontend.');

  } catch (error) {
    console.error('❌ API Error:', error.message);
    console.error('Response:', error.response?.status, error.response?.data);
  }
};

testEmailMFA();
