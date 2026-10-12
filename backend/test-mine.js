const http = require('http');

async function testMine() {
  const loginData = JSON.stringify({ email: 'student@idealens.edu', password: 'Password123!' });
  const req = http.request({
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const token = JSON.parse(body).token;
      const projReq = http.request({
        hostname: '127.0.0.1',
        port: 5001,
        path: '/api/projects?mine=true',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }, (pRes) => {
        let pBody = '';
        pRes.on('data', c => pBody += c);
        pRes.on('end', () => {
          const json = JSON.parse(pBody);
          console.log('=== GET /api/projects?mine=true ===');
          console.log('HTTP Status:', pRes.statusCode);
          console.log('Returned project count:', json.count);
          console.log('Array length:', json.data.length);
          console.log('First 5 projects:');
          json.data.slice(0, 5).forEach((p, i) => {
            console.log((i + 1) + '. ID: ' + p._id + ' | Title: "' + p.title + '" | Status: ' + p.status);
            console.log('   Ownership field (studentId): ' + (typeof p.studentId === 'object' ? p.studentId._id + ' (' + p.studentId.email + ')' : p.studentId));
          });
        });
      });
      projReq.end();
    });
  });
  req.write(loginData);
  req.end();
}

testMine();
