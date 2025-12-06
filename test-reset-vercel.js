#!/usr/bin/env node

/**
 * Test script to call Vercel backend reset endpoint
 */

import https from 'https';

const options = {
  hostname: 'backend-college-hub.vercel.app',
  port: 443,
  path: '/api/admin/reset-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const body = JSON.stringify({ adminToken: 'admin-reset-2025' });

console.log('[Test] Calling backend reset endpoint...');
console.log('[Test] URL: https://backend-college-hub.vercel.app/api/admin/reset-db');
console.log('[Test] Payload:', body);

const req = https.request(options, (res) => {
  console.log('\n[Test] Response Status:', res.statusCode);
  console.log('[Test] Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('[Test] Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Database reset on Vercel');
    } else {
      console.log('\n⚠️  Response indicates issue. Status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('[Test] ❌ Request Error:', error.message);
});

req.write(body);
req.end();
