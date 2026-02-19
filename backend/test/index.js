/**
 * ScriptForge API Test Suite
 * Run with: npm test
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = { username: 'testuser', password: 'test123' };
const ADMIN_USER = { username: 'admin', password: 'admin123' };

// Helper function to make requests
const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Test results
let passed = 0;
let failed = 0;

const assert = (condition, message) => {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
};

// Test cases
async function runTests() {
  console.log('\n🧪 ScriptForge API Test Suite\n');
  console.log('=' .repeat(50));

  let userToken = null;
  let adminToken = null;
  let testScriptId = null;

  try {
    // Test 1: Health check
    console.log('\n📋 Test 1: Health Check');
    const health = await request('GET', '/api/presets');
    assert(health.status === 200, 'Server is running');

    // Test 2: User Registration
    console.log('\n📋 Test 2: User Registration');
    const register = await request('POST', '/api/auth/register', {
      username: 'newuser' + Date.now(),
      password: 'test123',
      email: 'new@test.com'
    });
    assert(register.status === 200, 'User registration works');

    // Test 3: User Login
    console.log('\n📋 Test 3: User Login');
    const login = await request('POST', '/api/auth/login', TEST_USER);
    assert(login.status === 200, 'User login works');
    assert(login.data.data && login.data.data.token, 'Token is returned');
    userToken = login.data.data?.token;

    // Test 4: Admin Login
    console.log('\n📋 Test 4: Admin Login');
    const adminLogin = await request('POST', '/api/auth/login', ADMIN_USER);
    assert(adminLogin.status === 200, 'Admin login works');
    assert(adminLogin.data.data?.user?.role === 'admin', 'Admin role is correct');
    adminToken = adminLogin.data.data?.token;

    // Test 5: Get User Info
    console.log('\n📋 Test 5: Get User Info');
    const userInfo = await request('GET', '/api/auth/info', null, userToken);
    assert(userInfo.status === 200, 'Get user info works');
    assert(userInfo.data.data?.username === TEST_USER.username, 'Username matches');

    // Test 6: Get Presets
    console.log('\n📋 Test 6: Get Presets');
    const presets = await request('GET', '/api/presets');
    assert(presets.status === 200, 'Get presets works');
    assert(presets.data.data?.genre?.length > 0, 'Genre presets available');

    // Test 7: Get Random Prompt
    console.log('\n📋 Test 7: Get Random Prompt');
    const randomPrompt = await request('GET', '/api/presets/random-prompt');
    assert(randomPrompt.status === 200, 'Random prompt works');
    assert(randomPrompt.data.data?.prompt, 'Prompt is generated');

    // Test 8: Get Public Scripts
    console.log('\n📋 Test 8: Get Public Scripts');
    const publicScripts = await request('GET', '/api/script/public');
    assert(publicScripts.status === 200, 'Get public scripts works');
    assert(Array.isArray(publicScripts.data.data), 'Returns array');

    // Test 9: Create Script
    console.log('\n📋 Test 9: Create Script');
    const createScript = await request('POST', '/api/script', {
      title: 'Test Script',
      presets: { genre: 'short', tone: 'happy' },
      content: { nodes: [] }
    }, userToken);
    assert(createScript.status === 200, 'Create script works');
    assert(createScript.data.data?.id, 'Script ID is returned');
    testScriptId = createScript.data.data?.id;

    // Test 10: Get User Scripts
    console.log('\n📋 Test 10: Get User Scripts');
    const userScripts = await request('GET', '/api/script', null, userToken);
    assert(userScripts.status === 200, 'Get user scripts works');
    assert(Array.isArray(userScripts.data.data), 'Returns array');

    // Test 11: Update Script
    console.log('\n📋 Test 11: Update Script');
    const updateScript = await request('PUT', `/api/script/${testScriptId}`, {
      title: 'Updated Test Script',
      presets: { genre: 'short', tone: 'happy' },
      content: { nodes: [{ id: 1, title: 'Chapter 1' }] },
      status: 'published'
    }, userToken);
    assert(updateScript.status === 200, 'Update script works');

    // Test 12: Get Script by ID
    console.log('\n📋 Test 12: Get Script by ID');
    const getScript = await request('GET', `/api/script/${testScriptId}`);
    assert(getScript.status === 200, 'Get script by ID works');
    assert(getScript.data.data?.title === 'Updated Test Script', 'Title is updated');

    // Test 13: AI Generate
    console.log('\n📋 Test 13: AI Generate');
    const aiGenerate = await request('POST', '/api/ai/generate', {
      prompt: '测试剧本生成',
      presets: { genre: 'short' },
      model: 'gpt-4'
    }, userToken);
    assert(aiGenerate.status === 200, 'AI generate works');

    // Test 14: AI Continue
    console.log('\n📋 Test 14: AI Continue');
    const aiContinue = await request('POST', '/api/ai/continue', {
      context: '故事继续...'
    }, userToken);
    assert(aiContinue.status === 200, 'AI continue works');

    // Test 15: Admin Stats
    console.log('\n📋 Test 15: Admin Stats');
    const stats = await request('GET', '/api/admin/stats', null, adminToken);
    assert(stats.status === 200, 'Admin stats works');
    assert(stats.data.data?.totalUsers !== undefined, 'Total users returned');

    // Test 16: Admin Get Users
    console.log('\n📋 Test 16: Admin Get Users');
    const adminUsers = await request('GET', '/api/admin/users', null, adminToken);
    assert(adminUsers.status === 200, 'Admin get users works');

    // Test 17: Unauthorized Access
    console.log('\n📋 Test 17: Unauthorized Access');
    const unauthorized = await request('GET', '/api/script');
    assert(unauthorized.status === 401, 'Returns 401 for unauthenticated request');

    // Test 18: Forbidden Access
    console.log('\n📋 Test 18: Forbidden Access');
    const forbidden = await request('GET', '/api/admin/stats', null, userToken);
    assert(forbidden.status === 403, 'Returns 403 for unauthorized role');

    // Test 19: Delete Script
    console.log('\n📋 Test 19: Delete Script');
    const deleteScript = await request('DELETE', `/api/script/${testScriptId}`, null, userToken);
    assert(deleteScript.status === 200, 'Delete script works');

    // Test 20: Verify Deletion
    console.log('\n📋 Test 20: Verify Deletion');
    const verifyDelete = await request('GET', `/api/script/${testScriptId}`);
    assert(verifyDelete.status === 404, 'Script is deleted');

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed.\n');
    process.exit(1);
  }
}

// Run tests
runTests();
