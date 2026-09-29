const http = require('http');
const app = require('../src/server');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

const PORT = 5099;
let server;
let studentToken;
let facultyToken;
let adminToken;
let testProjectId;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers
      },
      (res) => {
        let resBody = '';
        res.on('data', chunk => { resBody += chunk; });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(resBody);
          } catch (e) {
            json = resBody;
          }
          resolve({ status: res.statusCode, data: json });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('[Test Suite] Starting backend tests...');
  await connectDB();
  server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Healthcheck
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check endpoint returns healthy');

    // 2. Login Student
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@idealens.edu',
      password: 'Password123!'
    });
    assert(studentLogin.status === 200 && studentLogin.data.token, 'Student can log in and receives JWT');
    studentToken = studentLogin.data.token;

    // 3. Login Faculty
    const facultyLogin = await request('POST', '/api/auth/login', {
      email: 'faculty@idealens.edu',
      password: 'Password123!'
    });
    assert(facultyLogin.status === 200 && facultyLogin.data.user.role === 'faculty', 'Faculty can log in with faculty role');
    facultyToken = facultyLogin.data.token;

    // 4. Login Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@idealens.edu',
      password: 'Password123!'
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin can log in with admin role');
    adminToken = adminLogin.data.token;

    // 5. Get Current Profile
    const me = await request('GET', '/api/auth/me', null, studentToken);
    assert(me.status === 200 && me.data.user.email === 'student@idealens.edu', 'Protected /api/auth/me returns current user');

    // 6. List Projects
    const projectsList = await request('GET', '/api/projects', null, studentToken);
    assert(projectsList.status === 200 && projectsList.data.count > 0, `Projects list returns seeded projects (count: ${projectsList.data.count})`);

    // 7. Create New Project
    const newProjRes = await request('POST', '/api/projects', {
      title: 'Automated Solar Panel Dust Cleaner Drone',
      domain: 'IoT',
      problemStatement: 'Dust and bird droppings accumulation reduce photovoltaic solar farm output by up to 25%, while manual cleaning consumes scarce freshwater.',
      proposedSolution: 'An autonomous robotic cleaning drone that scans solar panel arrays and removes debris using compressed air sweeps and ultrasonic microfiber brushes.',
      targetUsers: 'Commercial solar park operators, renewable energy grid authorities',
      technologies: ['IoT', 'Python', 'Computer Vision', 'Raspberry Pi', 'Angular'],
      keyFeatures: ['Autonomous solar array navigation', 'Waterless dust cleaning mechanism', 'Efficiency recovery telemetry dashboard'],
      expectedOutcome: 'Restore 98% solar panel electrical generation capacity without freshwater consumption.'
    }, studentToken);
    assert(newProjRes.status === 201 && newProjRes.data.data._id, 'Student can create a new project idea with Version 1');
    testProjectId = newProjRes.data.data._id;

    // 8. Analyze Project (AI & Similarity)
    const analyzeRes = await request('POST', `/api/projects/${testProjectId}/analyze`, null, studentToken);
    assert(analyzeRes.status === 200 && analyzeRes.data.data.analysis, 'Analyze endpoint returns structured AI analysis');
    assert(analyzeRes.data.data.similarity && Array.isArray(analyzeRes.data.data.similarity.topMatches), 'Analyze endpoint returns similarity results with top matches');

    // 9. Create Version 2
    const v2Res = await request('POST', `/api/projects/${testProjectId}/versions`, {
      title: 'Automated Solar Panel Dust Cleaner Drone with Thermal Infrared Crack Diagnostics',
      changeSummary: 'Added thermal imaging camera to detect cracked cells while cleaning.',
      technologies: ['IoT', 'Python', 'Computer Vision', 'Raspberry Pi', 'Angular', 'Thermal Imaging FLIR']
    }, studentToken);
    assert(v2Res.status === 201 && v2Res.data.data.versionNumber === 2, 'Version 2 created successfully');

    // 10. Compare Versions
    const compareRes = await request('GET', `/api/projects/${testProjectId}/versions/compare?v1=1&v2=2`, null, studentToken);
    assert(compareRes.status === 200 && compareRes.data.data.diff.addedTechnologies.length > 0, 'Version comparison accurately detects added technologies');

    // 11. Submit Project for Faculty Review
    const submitRes = await request('POST', `/api/projects/${testProjectId}/submit`, null, studentToken);
    assert(submitRes.status === 200 && submitRes.data.data.status === 'submitted', 'Project status transitions to submitted');

    // 12. Faculty Review Project
    const reviewRes = await request('POST', `/api/projects/${testProjectId}/reviews`, {
      statusDecision: 'approved',
      comments: 'Waterless cleaning for solar panels is a high-impact engineering innovation. Highly feasible and recommended for final build.',
      criteriaRatings: { problemClarity: 5, innovationNovelty: 5, technicalFeasibility: 4, societalImpact: 5 }
    }, facultyToken);
    assert(reviewRes.status === 201 && reviewRes.data.projectStatus === 'approved', 'Faculty can approve project and status is updated');

    // 13. Traceability Tree Creation
    const reqRes = await request('POST', `/api/projects/${testProjectId}/requirements`, {
      title: 'Autonomous Flight Waypoint Navigation',
      description: 'The drone shall follow pre-mapped GPS waypoints over solar arrays.',
      priority: 'high'
    }, studentToken);
    assert(reqRes.status === 201 && reqRes.data.data.reqCode, 'Requirement created in Traceability module');

    // 14. Admin Statistics
    const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
    assert(statsRes.status === 200 && statsRes.data.data.users.total > 0, 'Admin stats return live aggregated platform metrics');

    console.log(`\n[Test Suite Completed] Total Passed: ${passed} | Failed: ${failed}`);
  } catch (err) {
    console.error('[Test Suite Error]:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
