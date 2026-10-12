const http = require('http');

async function testSecurity() {
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
    res.on('end', async () => {
      const auth = JSON.parse(body);
      const studentToken = auth.token;
      const authenticatedStudentId = auth.user.id;

      // Impersonation test payload: student tries to pass a forged studentId (Chloe Zhang: 6abb4cf73e7bf7558385a6dc)
      const fakeOwnerId = '6abb4cf73e7bf7558385a6dc';
      const projectPayload = JSON.stringify({
        title: 'Zero Trust Identity Impersonation Protection Verification',
        description: 'Verify backend assigns authenticated JWT user ID and rejects client forgery.',
        domain: 'Cybersecurity',
        studentId: fakeOwnerId // Forged owner
      });

      const createReq = http.request({
        hostname: '127.0.0.1',
        port: 5001,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(projectPayload),
          'Authorization': 'Bearer ' + studentToken
        }
      }, (cRes) => {
        let cBody = '';
        cRes.on('data', c => cBody += c);
        cRes.on('end', () => {
          const created = JSON.parse(cBody);
          console.log('=== PROJECT CREATION SECURITY AUDIT ===');
          console.log('HTTP Status:', cRes.statusCode);
          console.log('Client attempted to impersonate studentId:', fakeOwnerId);
          console.log('Backend assigned studentId:', created.data.studentId);
          console.log('Matches authenticated JWT studentId (' + authenticatedStudentId + '):', created.data.studentId === authenticatedStudentId);
          console.log('Did client impersonation succeed:', created.data.studentId === fakeOwnerId ? 'CRITICAL SECURITY FLAW' : 'SECURE (Backend overrode client forgery)');

          // Check persistence by querying the project directly
          const getReq = http.request({
            hostname: '127.0.0.1',
            port: 5001,
            path: '/api/projects/' + created.data._id,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + studentToken }
          }, (gRes) => {
            let gBody = '';
            gRes.on('data', c => gBody += c);
            gRes.on('end', () => {
              const fetched = JSON.parse(gBody);
              console.log('Direct GET /api/projects/:id status:', gRes.statusCode);
              console.log('Fetched project title:', fetched.data.title);
              console.log('Fetched project owner in MongoDB:', fetched.data.studentId.email);
            });
          });
          getReq.end();
        });
      });
      createReq.write(projectPayload);
      createReq.end();
    });
  });
  req.write(loginData);
  req.end();
}

testSecurity();
