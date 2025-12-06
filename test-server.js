#!/usr/bin/env node

console.log('Starting debug test...');

// Simple HTTP server for testing
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'OK' }));
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Keep process alive
setInterval(() => {
  console.log('Server still running...');
}, 5000);
