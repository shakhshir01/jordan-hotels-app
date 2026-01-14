import axios from 'axios';

const testAPI = async () => {
  const apiUrl = 'https://yv2tcnk6ae.execute-api.us-east-1.amazonaws.com/prod';
  
  console.log('🔍 Testing API Gateway connectivity...');
  console.log(`API URL: ${apiUrl}`);
  
  try {
    // Test 1: Get all hotels
    console.log('\n📋 Test 1: GET /hotels');
    const hotelsResponse = await axios.get(`${apiUrl}/hotels`);
    console.log('✅ Hotels list retrieved:', hotelsResponse.status, hotelsResponse.data?.length || 'N/A', 'items');
    
    // Test 2: Get a specific hotel (if hotels exist)
    if (hotelsResponse.data && hotelsResponse.data.length > 0) {
      const hotelId = hotelsResponse.data[0].id;
      console.log(`\n📋 Test 2: GET /hotels/${hotelId}`);
      const hotelResponse = await axios.get(`${apiUrl}/hotels/${hotelId}`);
      console.log('✅ Hotel details retrieved:', hotelResponse.status);
    }
    
    console.log('\n✅ API Gateway is accessible and responding correctly!');
  } catch (error) {
    console.error('❌ API Error:', error.message);
    console.error('Response:', error.response?.status, error.response?.data);
  }
};

testAPI();
