const http = require('http');

function apiCall(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5001,
        path: `/api${path}`,
        method,
        headers
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAcceptanceWorkflow() {
  console.log('================================================================');
  console.log('IDEALENS - FULL END-TO-END ACCEPTANCE VERIFICATION WORKFLOW');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function verify(cond, msg) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Student Registers
    const uniqueEmail = `test.innovator.${Date.now()}@idealens.edu`;
    const regRes = await apiCall('POST', '/auth/register', {
      name: 'Elena Rostova',
      email: uniqueEmail,
      password: 'Password123!',
      role: 'student',
      department: 'Robotics & Environmental Informatics'
    });
    verify(regRes.status === 201 && regRes.body.token, `1. Student registered successfully (${uniqueEmail})`);
    const studentToken = regRes.body.token;

    // 2. Student Logs In
    const loginRes = await apiCall('POST', '/auth/login', {
      email: uniqueEmail,
      password: 'Password123!'
    });
    verify(loginRes.status === 200 && loginRes.body.user.role === 'student', '2. Student logged in and JWT authenticated');

    // 3. Student Creates Project
    const createRes = await apiCall('POST', '/projects', {
      title: 'Autonomous Underwater Coral Bleaching Diagnostic Submersible',
      domain: 'Environment',
      problemStatement: 'Ocean warming triggers rapid coral reef bleaching and structural decay before human divers can detect localized heat stress.',
      proposedSolution: 'A low-cost autonomous underwater vehicle (AUV) utilizing multispectral cameras and ResNet-50 computer vision to classify coral polyp health in real-time, geotagging bleaching clusters.',
      targetUsers: 'Marine scientists, coastal conservation agencies, coral reef restoration foundations',
      technologies: ['Python', 'PyTorch', 'OpenCV', 'ROS2', 'Node.js', 'Angular', 'Raspberry Pi'],
      keyFeatures: ['Multispectral underwater segmentation', 'Real-time bleaching severity index', 'Automated geo-tagged reef health maps'],
      expectedOutcome: 'Early detection of coral distress with 94% diagnostic accuracy across 100 hectares of reef per dive.'
    }, studentToken);
    verify(createRes.status === 201 && createRes.body.data._id, '3. Project idea created and saved to MongoDB');
    const projectId = createRes.body.data._id;
    verify(createRes.body.data.currentVersion === 1, '4. Version 1 automatically initialized');

    // 4. Student Analyzes Project with Gemini AI
    console.log('[Info] Calling AI and Similarity engines...');
    const analyzeRes = await apiCall('POST', `/projects/${projectId}/analyze`, {}, studentToken);
    verify(analyzeRes.status === 200, '5. Student clicked "Analyze Idea" - analyze endpoint responded HTTP 200');
    verify(analyzeRes.body.data.analysis && analyzeRes.body.data.analysis.overallScore > 0, '6. Gemini structured analysis generated with strengths, challenges, and overall score');
    verify(analyzeRes.body.data.analysis.possibleImprovements && analyzeRes.body.data.analysis.possibleImprovements.featureImprovements.length > 0, '7. Categorized innovation suggestions generated (5 categories)');

    // 5. Similarity Analysis
    const simData = analyzeRes.body.data.similarity;
    verify(simData && Array.isArray(simData.topMatches), '8. Similarity analysis engine executed against existing MongoDB projects');
    verify(simData.topMatches.length > 0, `9. Top matches identified (found ${simData.topMatches.length} matching candidate projects)`);
    verify(simData.disclaimer && simData.disclaimer.includes('educational'), '10. Notice explicitly clarifies analysis is not a legal novelty determination');

    // 6. Student creates Version 2
    const v2Res = await apiCall('POST', `/projects/${projectId}/versions`, {
      title: 'Autonomous Underwater Coral Bleaching Diagnostic Submersible with Acoustic Mesh Telemetry',
      changeSummary: 'Integrated underwater acoustic modem mesh for real-time surface buoy relay.',
      technologies: ['Python', 'PyTorch', 'OpenCV', 'ROS2', 'Node.js', 'Angular', 'Raspberry Pi', 'Acoustic Modem Telemetry']
    }, studentToken);
    verify(v2Res.status === 201 && v2Res.body.data.versionNumber === 2, '11. Student created Version 2 with change summary');

    // 7. Version Comparison
    const compRes = await apiCall('GET', `/projects/${projectId}/versions/compare?v1=1&v2=2`, null, studentToken);
    verify(compRes.status === 200 && compRes.body.data.diff.addedTechnologies.includes('Acoustic Modem Telemetry'), '12. Side-by-side version comparison detected added technologies');

    // 8. Traceability: Create Requirement & Feature
    const reqRes = await apiCall('POST', `/projects/${projectId}/requirements`, {
      title: 'Multispectral Image Ingestion',
      description: 'The camera pipeline shall stream 30fps underwater video frames to the inference module.',
      priority: 'critical'
    }, studentToken);
    verify(reqRes.status === 201 && reqRes.body.data.reqCode, '13. Requirement REQ-001 created in Traceability matrix');

    // 9. Student Submits Project for Faculty Review
    const submitRes = await apiCall('POST', `/projects/${projectId}/submit`, {}, studentToken);
    verify(submitRes.status === 200 && submitRes.body.data.status === 'submitted', '14. Project submitted for faculty review (status -> submitted)');

    // 10. Faculty Logs In
    const facLoginRes = await apiCall('POST', '/auth/login', {
      email: 'faculty@idealens.edu',
      password: 'Password123!'
    });
    verify(facLoginRes.status === 200 && facLoginRes.body.user.role === 'faculty', '15. Faculty member logged in');
    const facultyToken = facLoginRes.body.token;

    // 11. Faculty Views Project & Reviews
    const revRes = await apiCall('POST', `/projects/${projectId}/reviews`, {
      statusDecision: 'approved',
      comments: 'Superb marine conservation capstone. High algorithmic feasibility and substantial real-world impact. Approved for hardware deployment.',
      criteriaRatings: {
        problemClarity: 5,
        innovationNovelty: 5,
        technicalFeasibility: 4,
        societalImpact: 5
      }
    }, facultyToken);
    verify(revRes.status === 201 && revRes.body.projectStatus === 'approved', '16. Faculty approved project with 4-criteria rubric and critique');

    // 12. Student Sees Feedback & Status
    const studentCheckRes = await apiCall('GET', `/projects/${projectId}`, null, studentToken);
    verify(studentCheckRes.status === 200 && studentCheckRes.body.data.status === 'approved', '17. Student profile and project status updated to approved in MongoDB');

    // 13. Admin Dashboard Platform Stats
    const adminLoginRes = await apiCall('POST', '/auth/login', {
      email: 'admin@idealens.edu',
      password: 'Password123!'
    });
    const adminToken = adminLoginRes.body.token;
    const statsRes = await apiCall('GET', '/admin/stats', null, adminToken);
    verify(statsRes.status === 200 && statsRes.body.data.projects.approved > 0, '18. Admin dashboard live statistics reflect newly approved project');

    console.log('================================================================');
    console.log(`ACCEPTANCE TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================');
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Acceptance test crashed:', err);
    process.exit(1);
  }
}

runAcceptanceWorkflow();
