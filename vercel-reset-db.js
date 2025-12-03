#!/usr/bin/env node

/**
 * Reset Vercel Database Script
 * This script resets the admin database on Vercel to fix password hash issues
 * 
 * Usage: node vercel-reset-db.js <VERCEL_URL> [ADMIN_TOKEN]
 * 
 * Example:
 *   node vercel-reset-db.js https://college-space-xyz.vercel.app admin-reset-2025
 */

const https = require('https');

const args = process.argv.slice(2);

if (!args[0]) {
  console.error('❌ Usage: node vercel-reset-db.js <VERCEL_URL> [ADMIN_TOKEN]');
  console.error('');
  console.error('Example:');
  console.error('  node vercel-reset-db.js https://college-space-xyz.vercel.app admin-reset-2025');
  process.exit(1);
}

const vercelUrl = args[0].replace(/\/$/, ''); // Remove trailing slash
const adminToken = args[1] || 'admin-reset-2025';

console.log('\n🔄 Resetting Vercel Database...');
console.log('URL:', vercelUrl);
console.log('Token:', '*'.repeat(adminToken.length - 4) + adminToken.slice(-4));
console.log('');

const endpoint = `${vercelUrl}/api/admin/reset-db`;
const url = new URL(endpoint);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const data = JSON.stringify({
  adminToken: adminToken
});

const req = https.request(url, options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS!');
        console.log('Response:', result);
        console.log('');
        console.log('Now you can login with:');
        console.log('  studentId: 000001');
        console.log('  password: Admin@2025');
        process.exit(0);
      } else {
        console.error('❌ ERROR (Status: ' + res.statusCode + ')');
        console.error('Response:', result);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', responseData);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
