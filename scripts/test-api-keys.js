#!/usr/bin/env node

/**
 * API Key Validation Test Script
 * Tests the provided search API keys for connectivity and basic functionality
 */

import https from 'https';
import http from 'http';

// API Keys provided
const API_KEYS = {
  BRAVE_API_KEY: 'BSACH1LOne7f_ejIG29RJvcT06mFcm0',
  EXA_API_KEY: '1796fbb9-baf0-4706-a5de-6a146b266528',
  PERPLEXITY_API_KEY: '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'
};

console.log('🔑 Testing API Keys for MediMind Expert Search System');
console.log('=====================================================\n');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.hostname === 'localhost' ? http : https;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => reject(err));
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Test Brave Search API
async function testBraveAPI() {
  console.log('🔍 Testing Brave Search API...');
  
  try {
    const options = {
      hostname: 'api.search.brave.com',
      path: '/res/v1/web/search?q=medical+research&count=1',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': API_KEYS.BRAVE_API_KEY,
        'User-Agent': 'MediMind-Expert/1.0'
      },
      timeout: 10000
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('✅ Brave API: SUCCESS');
      console.log(`   - Results found: ${data.web?.results?.length || 0}`);
      console.log(`   - Query processed: ${data.query?.original || 'unknown'}`);
      console.log(`   - Rate limit remaining: ${response.headers['x-ratelimit-remaining'] || 'not specified'}`);
    } else if (response.statusCode === 401) {
      console.log('❌ Brave API: UNAUTHORIZED - Invalid API key');
      console.log(`   - Status: ${response.statusCode} ${response.statusMessage}`);
    } else if (response.statusCode === 429) {
      console.log('⚠️  Brave API: RATE LIMITED - API key valid but quota exceeded');
      console.log(`   - Status: ${response.statusCode} ${response.statusMessage}`);
      console.log(`   - Rate limit reset: ${response.headers['x-ratelimit-reset'] || 'unknown'}`);
    } else {
      console.log(`⚠️  Brave API: UNEXPECTED RESPONSE - ${response.statusCode} ${response.statusMessage}`);
    }
    
  } catch (error) {
    console.log('❌ Brave API: CONNECTION ERROR');
    console.log(`   - Error: ${error.message}`);
  }
  
  console.log();
}

// Test Exa API
async function testExaAPI() {
  console.log('🔍 Testing Exa Search API...');
  
  try {
    const requestData = JSON.stringify({
      query: "medical research cardiology",
      num_results: 1,
      type: "neural"
    });

    const options = {
      hostname: 'api.exa.ai',
      path: '/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEYS.EXA_API_KEY,
        'User-Agent': 'MediMind-Expert/1.0',
        'Content-Length': Buffer.byteLength(requestData)
      },
      timeout: 15000
    };

    const response = await makeRequest(options, requestData);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('✅ Exa API: SUCCESS');
      console.log(`   - Results found: ${data.results?.length || 0}`);
      console.log(`   - Request ID: ${data.requestId || 'not provided'}`);
    } else if (response.statusCode === 401) {
      console.log('❌ Exa API: UNAUTHORIZED - Invalid API key');
      console.log(`   - Status: ${response.statusCode} ${response.statusMessage}`);
    } else if (response.statusCode === 429) {
      console.log('⚠️  Exa API: RATE LIMITED - API key valid but quota exceeded');
      console.log(`   - Status: ${response.statusCode} ${response.statusMessage}`);
    } else {
      console.log(`⚠️  Exa API: UNEXPECTED RESPONSE - ${response.statusCode} ${response.statusMessage}`);
      console.log(`   - Response body: ${response.body.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log('❌ Exa API: CONNECTION ERROR');
    console.log(`   - Error: ${error.message}`);
  }
  
  console.log();
}

// Test Perplexity API
async function testPerplexityAPI() {
  console.log('🔍 Testing Perplexity AI API...');
  
  try {
    const requestData = JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: "What are the latest developments in cardiology research?"
        }
      ],
      max_tokens: 50,
      temperature: 0.2,
      top_p: 0.9,
      stream: false
    });

    const options = {
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.PERPLEXITY_API_KEY}`,
        'User-Agent': 'MediMind-Expert/1.0',
        'Content-Length': Buffer.byteLength(requestData)
      },
      timeout: 20000
    };

    const response = await makeRequest(options, requestData);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('✅ Perplexity API: SUCCESS');
      console.log(`   - Model used: ${data.model || 'unknown'}`);
      console.log(`   - Response length: ${data.choices?.[0]?.message?.content?.length || 0} characters`);
      console.log(`   - Usage tokens: ${JSON.stringify(data.usage || {})}`);
    } else if (response.statusCode === 401) {
      console.log('❌ Perplexity API: UNAUTHORIZED - Invalid API key');
      console.log(`   - Status: ${response.statusCode} ${response.statusMessage}`);
    } else if (response.statusCode === 429) {
      console.log('⚠️  Perplexity API: RATE LIMITED - API key valid but quota exceeded');
      console.log(`   - Status: ${response.statusCode} ${response.statusMessage}`);
    } else {
      console.log(`⚠️  Perplexity API: UNEXPECTED RESPONSE - ${response.statusCode} ${response.statusMessage}`);
      console.log(`   - Response body: ${response.body.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log('❌ Perplexity API: CONNECTION ERROR');
    console.log(`   - Error: ${error.message}`);
  }
  
  console.log();
}

// Main test execution
async function runTests() {
  console.log('Starting API key validation tests...\n');
  
  const startTime = Date.now();
  
  // Run all tests
  await testBraveAPI();
  await testExaAPI(); 
  await testPerplexityAPI();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('=====================================================');
  console.log(`🏁 API Key Tests Completed in ${duration} seconds`);
  console.log('');
  console.log('📋 Summary:');
  console.log('- ✅ = API key is valid and working');
  console.log('- ⚠️  = API key is valid but may have quota/rate limits');
  console.log('- ❌ = API key is invalid or service is unavailable');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. If all tests show ✅, proceed with deployment');
  console.log('2. If any tests show ❌, check API key configuration');
  console.log('3. If tests show ⚠️ , monitor usage during deployment');
  console.log('4. Update environment variables in your deployment system');
  console.log('');
  console.log('🚀 Ready for deployment configuration!');
}

// Handle process events
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('❌ Fatal error during API testing:', error);
  process.exit(1);
});