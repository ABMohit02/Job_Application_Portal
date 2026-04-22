const http = require('http');

const data = JSON.stringify({
  name: 'Test User Debug',
  email: 'debug_test_' + Date.now() + '@example.com',
  password: 'password123',
  role: 'user'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', body);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
  console.error('Make sure backend is running on port 5001');
});

req.write(data);
req.end();
