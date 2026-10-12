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

    // 7b. Check Analysis before generation (returns 200 with data: null)
    const beforeAnalysisRes = await request('GET', `/api/projects/${testProjectId}/analysis?version=1`, null, studentToken);
    assert(beforeAnalysisRes.status === 200 && beforeAnalysisRes.data.data === null, 'GET analysis before generation returns 200 with data: null');

    // 8. Analyze Project (AI & Similarity)
    const analyzeRes = await request('POST', `/api/projects/${testProjectId}/analyze`, null, studentToken);
    assert(analyzeRes.status === 200 && analyzeRes.data.data.analysis, 'Analyze endpoint returns structured AI analysis');
    assert(analyzeRes.data.data.similarity && Array.isArray(analyzeRes.data.data.similarity.topMatches), 'Analyze endpoint returns similarity results with top matches');

    // 8b. Check Analysis after generation (returns 200 with saved analysis)
    const afterAnalysisRes = await request('GET', `/api/projects/${testProjectId}/analysis?version=1`, null, studentToken);
    assert(afterAnalysisRes.status === 200 && afterAnalysisRes.data.data !== null && afterAnalysisRes.data.data.overallScore, 'GET analysis after generation returns 200 with saved analysis');

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

    // 13. Traceability Tree: Requirement -> Feature -> Test Case -> Issue
    const reqRes = await request('POST', `/api/projects/${testProjectId}/requirements`, {
      title: 'Autonomous Flight Waypoint Navigation',
      description: 'The drone shall follow pre-mapped GPS waypoints over solar arrays.',
      priority: 'high'
    }, studentToken);
    assert(reqRes.status === 201 && reqRes.data.data.reqCode, 'Requirement created in Traceability module');
    const createdReqId = reqRes.data.data._id;

    const featRes = await request('POST', `/api/projects/${testProjectId}/features`, {
      requirementId: createdReqId,
      title: 'GPS Waypoint Auto-Pilot Route Generator',
      description: 'Calculates optimal coverage path minimizing battery depletion.',
      complexity: 'medium'
    }, studentToken);
    assert(featRes.status === 201 && featRes.data.data.code, 'Feature created linked to Requirement');
    const createdFeatId = featRes.data.data._id;

    const tcRes = await request('POST', `/api/projects/${testProjectId}/testcases`, {
      featureId: createdFeatId,
      requirementId: createdReqId,
      title: 'Waypoint Arrival Tolerance Test',
      expectedResult: 'Drone reaches within 0.5m radius of designated coordinates'
    }, studentToken);
    assert(tcRes.status === 201 && tcRes.data.data.code, 'Test Case created linked to Feature');
    const createdTcId = tcRes.data.data._id;

    const issRes = await request('POST', `/api/projects/${testProjectId}/issues`, {
      requirementId: createdReqId,
      featureId: createdFeatId,
      testCaseId: createdTcId,
      title: 'GPS Glitch Drift in High Winds',
      description: 'Wind gusts cause momentary navigation drift exceeding 1.2m',
      severity: 'major'
    }, studentToken);
    assert(issRes.status === 201 && issRes.data.data.code, 'Issue created linked to Test Case and Feature');
    const createdIssueId = issRes.data.data._id;

    // 14. Full Traceability Matrix Endpoint
    const matrixRes = await request('GET', `/api/projects/${testProjectId}/traceability-matrix`, null, studentToken);
    assert(matrixRes.status === 200 && matrixRes.data.data.matrix.length > 0, 'Full Traceability Matrix returns nested tree hierarchy');

    // 15. Direct Traceability Deletion (Verifying route routing fix)
    const delIssueRes = await request('DELETE', `/api/projects/issues/${createdIssueId}`, null, studentToken);
    assert(delIssueRes.status === 200, 'Direct Issue deletion via /api/projects/issues/:id succeeded');

    const delReqRes = await request('DELETE', `/api/projects/requirements/${createdReqId}`, null, studentToken);
    assert(delReqRes.status === 200, 'Direct Requirement deletion with cascade via /api/projects/requirements/:id succeeded');

    // 16. Role Authorization Security Checks
    const studentReviewAttempt = await request('POST', `/api/projects/${testProjectId}/reviews`, {
      statusDecision: 'approved',
      comments: 'Malicious attempt by student to review own project'
    }, studentToken);
    assert(studentReviewAttempt.status === 403, 'Security: Student is forbidden (403) from creating faculty reviews');

    const studentAdminAttempt = await request('GET', '/api/admin/users', null, studentToken);
    assert(studentAdminAttempt.status === 403, 'Security: Student is forbidden (403) from accessing admin user management');

    const noAuthAttempt = await request('GET', '/api/auth/me', null, null);
    assert(noAuthAttempt.status === 401, 'Security: Unauthenticated request is rejected with HTTP 401');

    // 17. Invalid State Transition Prevention
    const invalidSubmitAttempt = await request('POST', `/api/projects/${testProjectId}/submit`, null, studentToken);
    assert(invalidSubmitAttempt.status === 400, 'Workflow: Submitting an already approved project is prevented (HTTP 400)');

    // 18. Admin Statistics
    const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
    assert(statsRes.status === 200 && statsRes.data.data.users.total > 0, 'Admin stats return live aggregated platform metrics');

    // 19. Student Dashboard Metrics
    const studentDashRes = await request('GET', '/api/dashboard/student', null, studentToken);
    assert(studentDashRes.status === 200 && typeof studentDashRes.data.data.totalProjects === 'number', 'Student dashboard endpoint returns real MongoDB metrics');

    // 20. Faculty Dashboard Metrics
    const facultyDashRes = await request('GET', '/api/dashboard/faculty', null, facultyToken);
    assert(facultyDashRes.status === 200 && typeof facultyDashRes.data.data.totalSubmissions === 'number', 'Faculty dashboard endpoint returns real MongoDB metrics');

    // 21. Student Mine Projects Filtering
    const myProjectsRes = await request('GET', '/api/projects?mine=true', null, studentToken);
    assert(myProjectsRes.status === 200 && Array.isArray(myProjectsRes.data.data), 'Projects query with mine=true returns student projects array');

    // 22. Unified /api/dashboard/stats Endpoint for Student
    const studentStatsApi = await request('GET', '/api/dashboard/stats', null, studentToken);
    assert(
      studentStatsApi.status === 200 &&
      typeof studentStatsApi.data.data.totalProjects === 'number' &&
      typeof studentStatsApi.data.data.draft === 'number' &&
      typeof studentStatsApi.data.data.submitted === 'number' &&
      typeof studentStatsApi.data.data.underReview === 'number' &&
      typeof studentStatsApi.data.data.approved === 'number',
      '/api/dashboard/stats for Student returns complete breakdown (totalProjects, draft, submitted, underReview, approved)'
    );

    // 23. Unified /api/dashboard/stats Endpoint for Faculty
    const facultyStatsApi = await request('GET', '/api/dashboard/stats', null, facultyToken);
    assert(
      facultyStatsApi.status === 200 &&
      typeof facultyStatsApi.data.data.totalSubmissions === 'number' &&
      typeof facultyStatsApi.data.data.pendingReview === 'number',
      '/api/dashboard/stats for Faculty returns evaluation metrics'
    );

    // 24. Unified /api/dashboard/stats Endpoint for Admin
    const adminStatsApi = await request('GET', '/api/dashboard/stats', null, adminToken);
    assert(
      adminStatsApi.status === 200 &&
      adminStatsApi.data.data.users.total > 0 &&
      adminStatsApi.data.data.projects.total > 0,
      '/api/dashboard/stats for Admin returns global platform counts'
    );

    // 25. Acceptance Project Creation & Workflow Verification
    const acceptanceProjRes = await request('POST', '/api/projects', {
      title: 'AI Campus Safety Intelligence Platform',
      description: 'An AI-assisted platform for monitoring campus safety incidents, identifying risk patterns, and providing decision-support insights.',
      domain: 'AI / Data Science',
      problemStatement: 'Campus safety monitoring needs proactive AI risk detection and decision support.',
      objectives: ['Detect safety incidents in real-time', 'Provide geospatial threat heatmaps'],
      methodology: 'Distributed streaming with deep learning anomaly detectors',
      expectedOutcomes: 'Reduced incident response time from 15 mins to under 2 mins',
      technologies: ['Node.js', 'Angular', 'Python', 'OpenCV', 'TensorFlow', 'MongoDB']
    }, studentToken);
    assert(acceptanceProjRes.status === 201 && acceptanceProjRes.data.data.title === 'AI Campus Safety Intelligence Platform', 'Acceptance: Student creates AI Campus Safety Intelligence Platform');

    const acceptanceProjId = acceptanceProjRes.data.data._id;
    // Analysis
    const acceptanceAnalysis = await request('POST', `/api/projects/${acceptanceProjId}/analyze`, null, studentToken);
    assert(acceptanceAnalysis.status === 200 && acceptanceAnalysis.data.data.analysis, 'Acceptance: AI Analysis generated and saved for project');

    // Similarity
    const acceptanceSimilar = await request('GET', `/api/projects/${acceptanceProjId}/similar?version=1`, null, studentToken);
    assert(acceptanceSimilar.status === 200 && Array.isArray(acceptanceSimilar.data.data.topMatches), 'Acceptance: Similarity search returns ranked MongoDB projects');

    // ALM Traceability chain
    const accReqRes = await request('POST', `/api/projects/${acceptanceProjId}/requirements`, {
      title: 'Incident Ingestion Pipeline',
      description: 'Ingest video feeds and alerts',
      type: 'functional',
      priority: 'high'
    }, studentToken);
    assert(accReqRes.status === 201, 'Acceptance: Requirement persisted');

    const accFeatRes = await request('POST', `/api/projects/${acceptanceProjId}/features`, {
      requirementId: accReqRes.data.data._id,
      title: 'Real-time Stream Processor',
      description: 'Processes camera frames',
      complexity: 'complex',
      status: 'in_development'
    }, studentToken);
    assert(accFeatRes.status === 201, 'Acceptance: Feature linked to Requirement');

    const accTestRes = await request('POST', `/api/projects/${acceptanceProjId}/testcases`, {
      featureId: accFeatRes.data.data._id,
      title: 'Verify Stream Latency Under 200ms',
      description: 'Simulate 50 parallel video feeds',
      expectedResult: 'Latency remains below 200ms across all 50 parallel streams',
      status: 'passed'
    }, studentToken);
    assert(accTestRes.status === 201, 'Acceptance: Test Case linked to Feature');

    const accIssueRes = await request('POST', `/api/projects/${acceptanceProjId}/issues`, {
      featureId: accFeatRes.data.data._id,
      testCaseId: accTestRes.data.data._id,
      title: 'Buffer overflow on RTSP reconnection',
      description: 'Need retry queue with exponential backoff',
      severity: 'major',
      status: 'open'
    }, studentToken);
    assert(accIssueRes.status === 201, 'Acceptance: Issue linked to Test Case and Feature');

    // Submit project
    const accSubmitRes = await request('POST', `/api/projects/${acceptanceProjId}/submit`, null, studentToken);
    assert(accSubmitRes.status === 200 && accSubmitRes.data.data.status === 'submitted', 'Acceptance: Student submits project');

    // Faculty review - request revision
    const revRequestRes = await request('POST', `/api/projects/${acceptanceProjId}/reviews`, {
      statusDecision: 'revision_requested',
      rubricScores: { novelty: 8, feasibility: 7, clarity: 6, relevance: 8 },
      comments: 'Please elaborate on the edge AI gateway deployment architecture'
    }, facultyToken);
    assert(revRequestRes.status === 201 && revRequestRes.data.data.statusDecision === 'revision_requested', 'Acceptance: Faculty requests revision');

    // Student creates version snapshot / edits and resubmits
    const accV2Res = await request('POST', `/api/projects/${acceptanceProjId}/versions`, {
      title: 'AI Campus Safety Intelligence Platform (v2)',
      changelog: 'Added edge gateway deployment architecture with ONNX runtime'
    }, studentToken);
    assert(accV2Res.status === 201 && accV2Res.data.data.versionNumber === 2, 'Acceptance: Version snapshot created in MongoDB');

    const resubmitRes = await request('POST', `/api/projects/${acceptanceProjId}/submit`, null, studentToken);
    assert(resubmitRes.status === 200 && (resubmitRes.data.data.status === 'resubmitted' || resubmitRes.data.data.status === 'submitted'), 'Acceptance: Student resubmits project');

    // Faculty final approval
    const approveRes = await request('POST', `/api/projects/${acceptanceProjId}/reviews`, {
      statusDecision: 'approved',
      rubricScores: { novelty: 9, feasibility: 9, clarity: 9, relevance: 9 },
      comments: 'Excellent improvements on edge compute. Approved for capstone execution.'
    }, facultyToken);
    assert(approveRes.status === 201 && approveRes.data.data.statusDecision === 'approved' && approveRes.data.projectStatus === 'approved', 'Acceptance: Faculty approves project');

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
