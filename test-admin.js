const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API endpoints...');
    
    // Test submissions endpoint
    console.log('\n1. Testing submissions endpoint...');
    const submissionsResponse = await fetch('http://localhost:3000/api/admin/submissions');
    console.log('Submissions status:', submissionsResponse.status);
    
    if (submissionsResponse.ok) {
      const submissions = await submissionsResponse.json();
      console.log('✅ Submissions loaded:', submissions.length);
    }
    
    // Test retrain endpoint
    console.log('\n2. Testing retrain endpoint...');
    const retrainResponse = await fetch('http://localhost:3000/api/admin/retrain-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Retrain status:', retrainResponse.status);
    
    if (retrainResponse.ok) {
      const result = await retrainResponse.json();
      console.log('✅ Retrain result:', result);
    } else {
      const error = await retrainResponse.text();
      console.log('❌ Retrain error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAPI();
