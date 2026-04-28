const http = require('http');

const routes = [
  '/api/announcement',
  '/api/settings',
  '/api/admin/fans',
  '/api/cruise/count',
  '/api/feed',
  '/api/fans',
  '/api/live',
  '/api/live-rooms',
  '/api/stream',
  '/api/merch',
  '/api/tour',
  '/api/sms/auto-blast',
  '/api/admin/settings',
  '/api/admin/shows',
  '/api/audio',
  '/api/shopify/inventory'
];

async function testRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      resolve({ route, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ route, status: 'ERROR', message: e.message });
    });
  });
}

async function run() {
  console.log("Testing GET API Routes...");
  for (const route of routes) {
    const result = await testRoute(route);
    let color = result.status === 200 ? '\x1b[32m' : (result.status === 500 ? '\x1b[31m' : '\x1b[33m');
    console.log(`${color}[${result.status}]\x1b[0m ${route}`);
  }
}

run();
