#!/usr/bin/env node

/**
 * Test various Perplexity AI model names to find valid ones
 */

import https from 'https';

const API_KEY = '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';

const MODELS_TO_TEST = [
  'llama-3.1-sonar-small-online',
  'llama-3.1-sonar-large-online', 
  'llama-3.1-sonar-huge-online',
  'llama-3-sonar-small-32k-online',
  'llama-3-sonar-large-32k-online',
  'sonar-small-online',
  'sonar-medium-online',
  'sonar-large-online',
  'pplx-7b-online',
  'pplx-70b-online',
  'mixtral-8x7b-instruct',
  'codellama-34b-instruct',
  'llama-2-70b-chat'
];

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
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

async function testModel(model) {
  try {
    const requestData = JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ],
      max_tokens: 5
    });

    const options = {
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'MediMind-Expert/1.0',
        'Content-Length': Buffer.byteLength(requestData)
      },
      timeout: 10000
    };

    const response = await makeRequest(options, requestData);
    
    if (response.statusCode === 200) {
      console.log(`✅ ${model} - WORKS`);
      return true;
    } else if (response.statusCode === 400) {
      const error = JSON.parse(response.body);
      if (error.error?.type === 'invalid_model') {
        console.log(`❌ ${model} - Invalid model`);
      } else {
        console.log(`⚠️  ${model} - ${error.error?.message || 'Unknown error'}`);
      }
      return false;
    } else {
      console.log(`⚠️  ${model} - HTTP ${response.statusCode}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ${model} - Connection error: ${error.message}`);
    return false;
  }
}

async function findValidModels() {
  console.log('🔍 Testing Perplexity AI Model Names');
  console.log('=====================================\n');
  
  const validModels = [];
  
  for (const model of MODELS_TO_TEST) {
    const isValid = await testModel(model);
    if (isValid) {
      validModels.push(model);
    }
    
    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=====================================');
  console.log('🎉 Valid Models Found:');
  if (validModels.length > 0) {
    validModels.forEach(model => console.log(`  ✅ ${model}`));
  } else {
    console.log('  ❌ No valid models found');
  }
  
  return validModels;
}

findValidModels().catch(console.error);