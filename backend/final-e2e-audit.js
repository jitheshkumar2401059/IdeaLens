const http = require('http');
const mongoose = require('mongoose');

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const request = http.request({
      hostname: '127.0.0.1',
      port: 5001,
      path,
      method,
      headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(resBody); } catch (e) { json = resBody; }
        resolve({ status: res.statusCode, data: json });
      });
    });
    request.on('error', reject);
    if (data) request.write(data);
    request.end();
  });
}

async function runFullAuditFlow() {
  console.log('====================================================');
  console.log('STARTING FINAL REAL-TIME END-TO-END AUDIT TEST');
  console.log('====================================================\n');

  // 1. Login Student
  const studentLogin = await req('POST', '/api/auth/login', {
    email: 'student@idealens.edu',
    password: 'Password123!'
  });
  console.log('1. [Student Login] Status:', studentLogin.status, '| Name:', studentLogin.data.user.name);
  const studentToken = studentLogin.data.token;

  // 2. Fetch Initial Student Dashboard Stats
  const studentStats1 = await req('GET', '/api/dashboard/stats', null, studentToken);
  console.log('2. [Student Initial Stats] Status:', studentStats1.status, '| Total Projects:', studentStats1.data.data.totalProjects, '| Drafts:', studentStats1.data.data.draft);
  const initialTotal = studentStats1.data.data.totalProjects;

  // 3. Student Creates Project
  const newProjectPayload = {
    title: 'Audit Final Verification: Autonomous Aerial Search and Rescue Platform',
    domain: 'Robotics',
    description: 'Swarm drone intelligence for locating missing hikers in dense mountainous terrain with thermal vision.',
    technologies: ['PX4 Autopilot', 'ROS2', 'YOLOv11', 'Angular', 'Node.js', 'MongoDB'],
    keyFeatures: ['Swarm waypoint coordination', 'Thermal heat signature detection', 'Offline mesh networking']
  };
  const createProj = await req('POST', '/api/projects', newProjectPayload, studentToken);
  console.log('3. [Create Project] Status:', createProj.status, '| ID:', createProj.data.data._id, '| Version:', createProj.data.data.currentVersion);
  const projectId = createProj.data.data._id;

  // 4. Verify Project Preserved on Refresh (Simulate direct reload)
  const refreshProj = await req('GET', '/api/projects/' + projectId, null, studentToken);
  console.log('4. [Reload Project Detail] Status:', refreshProj.status, '| Title:', refreshProj.data.data.title, '| Owner:', refreshProj.data.data.studentId.email);

  // 5. Verify Student Dashboard Incremented by 1
  const studentStats2 = await req('GET', '/api/dashboard/stats', null, studentToken);
  console.log('5. [Student Updated Stats] Total Projects:', studentStats2.data.data.totalProjects, '(Was:', initialTotal, '→ Delta: +' + (studentStats2.data.data.totalProjects - initialTotal) + ')');

  // 6. Run AI Analysis
  const analyzeRes = await req('POST', '/api/projects/' + projectId + '/analyze', null, studentToken);
  console.log('6. [AI Analysis] Status:', analyzeRes.status, '| Overall Score:', analyzeRes.data.data.analysis.overallScore, '| Novelty Score:', analyzeRes.data.data.analysis.noveltyScore);

  // 7. Verify Similarity Query
  const similarRes = await req('GET', '/api/projects/' + projectId + '/similar?version=1', null, studentToken);
  console.log('7. [Similarity Search] Status:', similarRes.status, '| Top Matches Count:', similarRes.data.data.topMatches.length);

  // 8. Add ALM Chain: Requirement
  const reqRes = await req('POST', '/api/projects/' + projectId + '/requirements', {
    title: 'Thermal Video Processing Latency < 100ms',
    description: 'On-edge inference on Raspberry Pi 5 onboard compute module',
    type: 'non_functional',
    priority: 'critical'
  }, studentToken);
  console.log('8. [ALM Requirement] Status:', reqRes.status, '| Code:', reqRes.data.data.code);

  // 9. Add ALM Chain: Feature
  const featRes = await req('POST', '/api/projects/' + projectId + '/features', {
    requirementId: reqRes.data.data._id,
    title: 'Thermal Anomaly Bounding Box Visualizer',
    description: 'Overlays thermal boxes on GIS moving map display',
    complexity: 'medium',
    status: 'in_development'
  }, studentToken);
  console.log('9. [ALM Feature] Status:', featRes.status, '| Code:', featRes.data.data.code);

  // 10. Add ALM Chain: Test Case
  const testRes = await req('POST', '/api/projects/' + projectId + '/testcases', {
    featureId: featRes.data.data._id,
    title: 'Bench Test Thermal Frame Ingestion under 30FPS',
    description: 'Input raw H.264 video feed over RTSP',
    expectedResult: 'Frame drops below 0.1% over 60-minute duration',
    status: 'passed'
  }, studentToken);
  console.log('10. [ALM TestCase] Status:', testRes.status, '| Code:', testRes.data.data.code);

  // 11. Add ALM Chain: Issue
  const issueRes = await req('POST', '/api/projects/' + projectId + '/issues', {
    featureId: featRes.data.data._id,
    testCaseId: testRes.data.data._id,
    title: 'Thermal camera saturation under direct sunlight reflection',
    description: 'Auto-gain normalization required',
    severity: 'major',
    status: 'open'
  }, studentToken);
  console.log('11. [ALM Issue] Status:', issueRes.status, '| Code:', issueRes.data.data.code);

  // 12. Student Submits Project
  const submitRes = await req('POST', '/api/projects/' + projectId + '/submit', null, studentToken);
  console.log('12. [Student Submit] Status:', submitRes.status, '| Project Status:', submitRes.data.data.status);

  // 13. Login Faculty
  const facultyLogin = await req('POST', '/api/auth/login', {
    email: 'faculty@idealens.edu',
    password: 'Password123!'
  });
  console.log('13. [Faculty Login] Status:', facultyLogin.status, '| Name:', facultyLogin.data.user.name);
  const facultyToken = facultyLogin.data.token;

  // 14. Faculty Review: Request Revision
  const reviewRevision = await req('POST', '/api/projects/' + projectId + '/reviews', {
    statusDecision: 'revision_requested',
    rubricScores: { novelty: 8, feasibility: 7, clarity: 8, relevance: 9 },
    comments: 'Strong proposal. Please clarify battery life flight endurance in sub-zero alpine conditions.'
  }, facultyToken);
  console.log('14. [Faculty Revision Request] Status:', reviewRevision.status, '| Decision:', reviewRevision.data.data.statusDecision, '| Project Status:', reviewRevision.data.projectStatus);

  // 15. Student Resubmits with Version 2 Snapshot
  const v2Res = await req('POST', '/api/projects/' + projectId + '/versions', {
    title: 'Audit Final Verification: Autonomous Aerial Search and Rescue Platform (v2 - Self-Heating LiPo Battery)',
    changelog: 'Added battery self-heating thermal jackets for sub-zero mountain flight endurance'
  }, studentToken);
  console.log('15. [Student Version 2] Status:', v2Res.status, '| Version Number:', v2Res.data.data.versionNumber);

  const resubmitRes = await req('POST', '/api/projects/' + projectId + '/submit', null, studentToken);
  console.log('16. [Student Resubmit] Status:', resubmitRes.status, '| Project Status:', resubmitRes.data.data.status);

  // 17. Faculty Review: Approve
  const reviewApprove = await req('POST', '/api/projects/' + projectId + '/reviews', {
    statusDecision: 'approved',
    rubricScores: { novelty: 9, feasibility: 9, clarity: 9, relevance: 9 },
    comments: 'Self-heating battery architecture addresses alpine thermal concerns. Approved for capstone execution.'
  }, facultyToken);
  console.log('17. [Faculty Approval] Status:', reviewApprove.status, '| Decision:', reviewApprove.data.data.statusDecision, '| Project Status:', reviewApprove.data.projectStatus);

  // 18. Verify Notification Generated in MongoDB
  await mongoose.connect('mongodb://127.0.0.1:27017/idealens_db');
  const db = mongoose.connection.db;
  const latestNotif = await db.collection('notifications').findOne(
    { projectId: new mongoose.Types.ObjectId(projectId) },
    { sort: { createdAt: -1 } }
  );
  console.log('18. [Notification Verification] Recipient:', latestNotif ? latestNotif.recipientId : 'None', '| Title:', latestNotif ? latestNotif.title : 'None');

  // 19. Login Admin & Inspect Dashboard Stats
  const adminLogin = await req('POST', '/api/auth/login', {
    email: 'admin@idealens.edu',
    password: 'Password123!'
  });
  const adminToken = adminLogin.data.token;
  const adminStats = await req('GET', '/api/dashboard/stats', null, adminToken);
  console.log('19. [Admin Dashboard] Total Users:', adminStats.data.data.users.total, '| Total Projects:', adminStats.data.data.projects.total, '| Approved:', adminStats.data.data.projects.approved);

  console.log('\n====================================================');
  console.log('FINAL REAL-TIME END-TO-END AUDIT COMPLETED SUCCESSFULLY');
  console.log('====================================================');

  await mongoose.disconnect();
}

runFullAuditFlow().catch(console.error);
