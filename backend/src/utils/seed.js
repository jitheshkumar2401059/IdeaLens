const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const ProjectVersion = require('../models/ProjectVersion');
const Analysis = require('../models/Analysis');
const SimilarityResult = require('../models/SimilarityResult');
const Requirement = require('../models/Requirement');
const Feature = require('../models/Feature');
const TestCase = require('../models/TestCase');
const Issue = require('../models/Issue');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Domain = require('../models/Domain');

const { MONGO_URI } = require('../config/env');

const initialDomains = [
  { name: 'Artificial Intelligence', description: 'Machine learning, neural networks, natural language processing', icon: 'cpu' },
  { name: 'Machine Learning', description: 'Supervised, unsupervised, reinforcement learning applications', icon: 'zap' },
  { name: 'Data Science', description: 'Big data analytics, data visualization, predictive modeling', icon: 'bar-chart' },
  { name: 'Web Development', description: 'Full-stack applications, PWAs, distributed web platforms', icon: 'globe' },
  { name: 'IoT', description: 'Internet of Things, embedded systems, connected sensors', icon: 'wifi' },
  { name: 'Cybersecurity', description: 'Network protection, identity verification, vulnerability auditing', icon: 'shield' },
  { name: 'Healthcare', description: 'Telemedicine, clinical diagnostic tools, health informatics', icon: 'heart' },
  { name: 'Education', description: 'EdTech platforms, intelligent tutoring, learning analytics', icon: 'book' },
  { name: 'Smart City', description: 'Urban mobility, smart grid, automated public services', icon: 'home' },
  { name: 'Environment', description: 'Sustainability monitoring, climate tracking, renewable energy', icon: 'feather' },
  { name: 'FinTech', description: 'Decentralized finance, automated payments, fraud analytics', icon: 'dollar-sign' },
  { name: 'Agriculture', description: 'Precision farming, crop disease detection, soil sensor networks', icon: 'sun' }
];

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB at', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected. Clearing previous test data...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      ProjectVersion.deleteMany({}),
      Analysis.deleteMany({}),
      SimilarityResult.deleteMany({}),
      Requirement.deleteMany({}),
      Feature.deleteMany({}),
      TestCase.deleteMany({}),
      Issue.deleteMany({}),
      Review.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      Domain.deleteMany({})
    ]);

    // Insert Domains
    await Domain.insertMany(initialDomains);
    console.log('[Seed] Domains inserted.');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@idealens.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'College Administration & Research Office'
    });

    const faculty1 = await User.create({
      name: 'Dr. Aris Thorne',
      email: 'faculty@idealens.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Computer Science and Artificial Intelligence'
    });

    const faculty2 = await User.create({
      name: 'Prof. Maya Raman',
      email: 'm.raman@idealens.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'Information Technology & Systems'
    });

    const student1 = await User.create({
      name: 'Aiden Vance',
      email: 'student@idealens.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Science and Engineering'
    });

    const student2 = await User.create({
      name: 'Chloe Zhang',
      email: 'chloe.z@idealens.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Data Science & AI'
    });

    const student3 = await User.create({
      name: 'Devon Miller',
      email: 'devon.m@idealens.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Internet of Things & Automation'
    });

    const student4 = await User.create({
      name: 'Priya Patel',
      email: 'priya.p@idealens.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Software Engineering'
    });

    console.log('[Seed] Users created.');

    // 2. Sample Project Ideas (18 diverse projects with realistic content)
    console.log('[Seed] Creating 18 realistic sample projects...');
    const projectSeedData = [
      {
        title: 'Smart Waste Management and Route Optimization System',
        domain: 'IoT',
        problemStatement: 'Municipalities struggle with overflowing public garbage bins and inefficient static collection truck schedules, leading to wasted fuel and hygiene issues.',
        proposedSolution: 'An IoT-enabled waste monitoring framework using ultrasonic distance sensors to monitor fill levels in real time, transmitting telemetry to a cloud platform that dynamically calculates optimal collection routes.',
        targetUsers: 'Municipal sanitation departments, waste management contractors, city administrators',
        technologies: ['IoT', 'Node.js', 'Express', 'MongoDB', 'Angular', 'Ultrasonic Sensors', 'Leaflet Maps'],
        keyFeatures: ['Real-time fill level telemetry', 'Automated collection route generation', 'Driver mobile route dashboard', 'Overflow threshold alert triggers'],
        expectedOutcome: '30% reduction in municipal fuel costs and elimination of overflowing bin complaints.',
        status: 'approved',
        studentId: student3._id,
        currentVersion: 2
      },
      {
        title: 'Campus Automated Waste Sorting and Predictive Bin Management',
        domain: 'IoT',
        problemStatement: 'University campuses generate massive volumes of recyclable and compostable waste that students misclassify, while custodial crews lack visibility into bin status.',
        proposedSolution: 'Smart campus waste stations equipped with optical cameras and fill sensors that automatically classify recyclables using computer vision, while alerting custodial staff before bins reach full capacity.',
        targetUsers: 'Campus facility management, university students, environmental sustainability committees',
        technologies: ['IoT', 'Python', 'OpenCV', 'Raspberry Pi', 'Ultrasonic Sensors', 'Node.js', 'Angular'],
        keyFeatures: ['Automated camera-based trash classification', 'Campus map bin fill visualization', 'Custodial route optimization alerts', 'Student gamified recycling score'],
        expectedOutcome: '50% improvement in campus recycling compliance and optimized custodial shift routing.',
        status: 'submitted',
        studentId: student1._id,
        currentVersion: 1
      },
      {
        title: 'AI-Powered Smart Attendance and Proxy Detection System',
        domain: 'Artificial Intelligence',
        problemStatement: 'Manual roll calls in large university lecture halls consume up to 15% of class duration and are susceptible to buddy-punching and proxy attendance frauds.',
        proposedSolution: 'A contactless classroom attendance system that captures panoramic classroom video, detects student faces using deep convolutional neural networks, and verifies identity with liveness detection.',
        targetUsers: 'University professors, teaching assistants, college registrar department',
        technologies: ['Python', 'OpenCV', 'FaceNet', 'TensorFlow', 'FastAPI', 'PostgreSQL', 'Angular'],
        keyFeatures: ['Multi-face instant classroom detection', 'Anti-spoofing liveness verification', 'Automated email alerts to chronic absentees', 'Integration with college LMS'],
        expectedOutcome: 'Zero attendance recording time overhead and 100% elimination of proxy attendance.',
        status: 'approved',
        studentId: student1._id,
        currentVersion: 2
      },
      {
        title: 'Biometric Face Recognition and Emotion Analysis for Smart Classrooms',
        domain: 'Artificial Intelligence',
        problemStatement: 'Educators in hybrid and large lecture formats cannot gauge whether students are engaged, confused, or distracted during complex lectures.',
        proposedSolution: 'An AI-driven student engagement platform that combines automated face recognition attendance with real-time aggregated facial expression and micro-emotion analysis to provide instant feedback to lecturers.',
        targetUsers: 'College educators, pedagogical researchers, curriculum development coordinators',
        technologies: ['Python', 'PyTorch', 'OpenCV', 'FaceNet', 'FastAPI', 'Angular', 'Chart.js'],
        keyFeatures: ['Automated facial recognition attendance', 'Aggregated confusion and engagement index', 'Lecture pace suggestion telemetry', 'Post-lecture engagement heatmaps'],
        expectedOutcome: 'Actionable real-time insights for instructors, improving student comprehension ratings by 25%.',
        status: 'under_review',
        studentId: student2._id,
        currentVersion: 1
      },
      {
        title: 'Decentralized Academic Credential Verification on Blockchain',
        domain: 'Cybersecurity',
        problemStatement: 'Forged degree certificates and slow paper-based background verification create friction in graduate employment and study abroad admissions.',
        proposedSolution: 'A tamper-proof credential issuance and verification platform that anchors cryptographic hashes of student transcripts and degrees onto a permissioned Ethereum blockchain ledger.',
        targetUsers: 'University registrars, recruitment agencies, employers, graduating alumni',
        technologies: ['Solidity', 'Ethereum', 'Node.js', 'Express', 'Web3.js', 'IPFS', 'Angular'],
        keyFeatures: ['Instant one-click QR code verification', 'Cryptographic tamper detection', 'Self-sovereign student credential wallet', 'Automated revocation and amendment logs'],
        expectedOutcome: 'Sub-second background verification with zero vulnerability to forged certificates.',
        status: 'approved',
        studentId: student4._id,
        currentVersion: 1
      },
      {
        title: 'Blockchain-Based Secure Medical Health Records Exchange',
        domain: 'Healthcare',
        problemStatement: 'Patient medical histories are fragmented across disparate hospital clinics, making emergency diagnostics risky and exposing records to data privacy breaches.',
        proposedSolution: 'A patient-centric electronic health record network leveraging decentralized identifiers and encrypted cloud storage where patients grant time-limited granular access to consulting physicians.',
        targetUsers: 'Patients, hospital physicians, diagnostic pathology labs, health insurance providers',
        technologies: ['Hyperledger Fabric', 'Node.js', 'Express', 'MongoDB', 'Angular', 'AES-256 Encryption'],
        keyFeatures: ['Patient-controlled consent access grants', 'Encrypted FHIR-compliant record storage', 'Audit log of every doctor record retrieval', 'Emergency break-glass access protocol'],
        expectedOutcome: 'Unified lifelong patient medical records with full HIPAA and GDPR privacy compliance.',
        status: 'revision_requested',
        studentId: student4._id,
        currentVersion: 1
      },
      {
        title: 'Precision Crop Disease Detection Using Drone Imagery and CNNs',
        domain: 'Agriculture',
        problemStatement: 'Smallholder farmers experience up to 40% crop yield loss due to late diagnosis of foliar diseases and pest infestations across large fields.',
        proposedSolution: 'An aerial agriculture surveillance application that analyzes multispectral drone photos of crop canopies using customized ResNet deep learning models to identify blight, rust, and nutrient deficiencies.',
        targetUsers: 'Commercial farmers, agricultural extension officers, agronomy researchers',
        technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenCV', 'Django', 'MongoDB', 'Angular'],
        keyFeatures: ['Multispectral image disease heatmaps', 'Pest infestation severity classification', 'Localized chemical treatment recommendations', 'Offline-first field worker mobile portal'],
        expectedOutcome: 'Early intervention capability reducing crop loss by 65% and cutting pesticide misuse.',
        status: 'approved',
        studentId: student3._id,
        currentVersion: 1
      },
      {
        title: 'IoT Soil Nutrients and Micro-Climate Monitoring for Smart Greenhouse',
        domain: 'Agriculture',
        problemStatement: 'Traditional greenhouse management relies on manual soil sampling and periodic inspections, which fail to catch rapid micro-climate fluctuations.',
        proposedSolution: 'An automated greenhouse control system with continuous NPK soil sensors, temperature, humidity, and soil moisture probes that trigger automated drip irrigation and ventilation.',
        targetUsers: 'Greenhouse horticulturists, urban vertical farmers, agritech startups',
        technologies: ['IoT', 'ESP32', 'MQTT', 'Node.js', 'Express', 'InfluxDB', 'Angular'],
        keyFeatures: ['Continuous NPK nutrient telemetry', 'Automated solenoid drip irrigation triggers', 'Climate threshold alerting via SMS/push', 'Historical yield correlation charts'],
        expectedOutcome: '40% water conservation and 20% higher greenhouse produce yields.',
        status: 'submitted',
        studentId: student3._id,
        currentVersion: 1
      },
      {
        title: 'Autonomous Urban Traffic Congestion Prediction and Adaptive Signals',
        domain: 'Smart City',
        problemStatement: 'Fixed-cycle traffic signal timers fail during rush hours, causing gridlock, excessive vehicle emissions, and delayed emergency vehicle responses.',
        proposedSolution: 'A computer-vision and graph neural network platform that counts intersection queue lengths from CCTV feeds and adjusts green-light duration in real time while creating green corridors for emergency vehicles.',
        targetUsers: 'City traffic police departments, urban mobility planners, ambulance dispatchers',
        technologies: ['Python', 'YOLOv8', 'DeepSORT', 'FastAPI', 'Node.js', 'Angular', 'WebSockets'],
        keyFeatures: ['Real-time vehicle density tracking', 'Dynamic signal timing orchestration', 'Emergency vehicle priority routing', 'Urban congestion predictive analytics'],
        expectedOutcome: '22% reduction in city commute wait times and faster emergency vehicle transit.',
        status: 'under_review',
        studentId: student2._id,
        currentVersion: 1
      },
      {
        title: 'Smart Streetlight Dimming and Fault Detection via LoRaWAN',
        domain: 'Smart City',
        problemStatement: 'Municipal streetlights consume enormous power during early morning hours and burnt-out bulbs go unnoticed for weeks without citizen complaints.',
        proposedSolution: 'A citywide connected streetlight network using LoRaWAN controllers that dims lights when no pedestrian or vehicular motion is sensed and immediately reports failed bulbs to maintenance depots.',
        targetUsers: 'Municipal electrical engineering departments, city sustainability auditors',
        technologies: ['IoT', 'LoRaWAN', 'C++', 'Node.js', 'Express', 'PostgreSQL', 'Angular'],
        keyFeatures: ['Motion-adaptive dynamic dimming', 'Instant burnt-out luminaire telemetry', 'Energy consumption cost analytics', 'Interactive maintenance dispatch map'],
        expectedOutcome: '60% reduction in municipal street lighting electrical consumption.',
        status: 'draft',
        studentId: student3._id,
        currentVersion: 1
      },
      {
        title: 'AI Diagnostic Copilot for Chest X-Ray Pathology Screening',
        domain: 'Healthcare',
        problemStatement: 'Radiologist shortages in rural and underserved clinics cause diagnostic backlogs for pneumonia, tuberculosis, and pleural effusion.',
        proposedSolution: 'A web-based clinical diagnostic support tool that examines DICOM chest radiographs using CheXNet convolutional architectures, highlighting suspicious radiological regions with Grad-CAM heatmaps.',
        targetUsers: 'Hospital radiologists, rural clinic medical practitioners, residency trainees',
        technologies: ['Python', 'PyTorch', 'DICOM Tools', 'FastAPI', 'Node.js', 'Angular', 'Cornerstone.js'],
        keyFeatures: ['Instant 14-pathology multi-label classification', 'Grad-CAM visual attention heatmaps', 'Radiology report draft generator', 'PACS system compatibility connector'],
        expectedOutcome: 'Triage turnaround time shortened from 48 hours to under 3 minutes.',
        status: 'approved',
        studentId: student2._id,
        currentVersion: 2
      },
      {
        title: 'Predictive Financial Fraud and AML Transaction Detection System',
        domain: 'FinTech',
        problemStatement: 'Legacy rule-based banking fraud engines miss sophisticated synthetic identity fraud and laundering rings while generating too many false positive alerts.',
        proposedSolution: 'A high-throughput fraud analytics engine that models customer transaction sequences as dynamic graph networks, detecting anomalies using XGBoost and Graph Convolutional Networks in real time.',
        targetUsers: 'Bank fraud investigation units, compliance officers, fintech payment processors',
        technologies: ['Python', 'XGBoost', 'Neo4j', 'Apache Kafka', 'Node.js', 'Angular', 'D3.js'],
        keyFeatures: ['Sub-100ms transaction risk scoring', 'Interactive graph relationship visualizer', 'Automated suspicious activity report filing', 'Explainable AI feature contribution plots'],
        expectedOutcome: '85% true fraud capture rate with a 60% reduction in false positive investigator alerts.',
        status: 'submitted',
        studentId: student1._id,
        currentVersion: 1
      },
      {
        title: 'Micro-Lending Credit Scoring for Unbanked Informal Sector Workers',
        domain: 'FinTech',
        problemStatement: 'Millions of gig economy workers and informal vendors lack traditional credit bureau history, shutting them out from formal banking credit.',
        proposedSolution: 'An alternative creditworthiness evaluation platform that computes fair credit scores from utility bill payment consistency, telecom airtime usage, and mobile money transaction velocity.',
        targetUsers: 'Non-banking financial institutions (NBFCs), micro-finance lenders, gig platforms',
        technologies: ['Python', 'Scikit-learn', 'Node.js', 'Express', 'MongoDB', 'Angular'],
        keyFeatures: ['Alternative financial footprint analyzer', 'Bias-audited credit score calculation', 'Applicant loan approval recommendation', 'Loan repayment tracking telemetry'],
        expectedOutcome: 'Financial inclusion for over 100,000 unbanked micro-entrepreneurs.',
        status: 'draft',
        studentId: student4._id,
        currentVersion: 1
      },
      {
        title: 'Adaptive AI Learning Platform with Personalized Knowledge Graphs',
        domain: 'Education',
        problemStatement: 'One-size-fits-all digital coursework fails to address individual student knowledge gaps, leading to student frustration and high course dropout rates.',
        proposedSolution: 'An intelligent tutoring platform that builds a dynamic knowledge graph of student skill mastery, dynamically recommending micro-lessons and adaptive quiz difficulties based on Bayesian Knowledge Tracing.',
        targetUsers: 'K-12 and university students, online course educators, academic curriculum leads',
        technologies: ['Node.js', 'Express', 'Neo4j', 'MongoDB', 'Angular', 'Python', 'WebSockets'],
        keyFeatures: ['Prerequisite dependency knowledge graph', 'Dynamic question difficulty adaptation', 'Identified concept misconception warnings', 'Visual mastery progress tree'],
        expectedOutcome: '35% faster mastery of STEM syllabus concepts and 40% reduction in course dropouts.',
        status: 'approved',
        studentId: student2._id,
        currentVersion: 1
      },
      {
        title: 'Automated Code Vulnerability and Secret Leak Detector for CI/CD',
        domain: 'Cybersecurity',
        problemStatement: 'Developers accidentally commit API keys, private credentials, and SQL injection flaws into Git repositories, exposing entire enterprise infrastructures.',
        proposedSolution: 'A pre-commit and pipeline static application security testing (SAST) tool that scans source code for high-entropy tokens, hardcoded secrets, and unsafe tainted inputs using AST parsers and regex engines.',
        targetUsers: 'DevOps engineers, software developers, chief information security officers',
        technologies: ['Node.js', 'Express', 'Tree-sitter', 'MongoDB', 'Docker', 'Angular'],
        keyFeatures: ['High-entropy secret detection with validation', 'Abstract Syntax Tree taint analysis', 'Automated pull-request security comments', 'Vulnerability remediation code snippets'],
        expectedOutcome: 'Zero credential leaks committed to production codebases.',
        status: 'under_review',
        studentId: student1._id,
        currentVersion: 1
      },
      {
        title: 'Industrial Factory Predictive Maintenance Using Vibration Analytics',
        domain: 'Data Science',
        problemStatement: 'Unexpected heavy machinery failures shut down factory assembly lines, resulting in tens of thousands of dollars in emergency repair and downtime costs.',
        proposedSolution: 'An edge industrial IoT monitoring suite that records high-frequency accelerometer vibrations from bearing housings, processing signals via Fast Fourier Transform (FFT) and LSTM networks to forecast failure weeks in advance.',
        targetUsers: 'Factory maintenance engineers, plant operations directors, equipment manufacturers',
        technologies: ['Python', 'TensorFlow', 'MQTT', 'Node.js', 'Express', 'MongoDB', 'Angular', 'Chart.js'],
        keyFeatures: ['FFT spectrum frequency breakdown', 'Remaining Useful Life (RUL) estimator', 'Automated maintenance work-order generation', 'Plant floor 3D status layout'],
        expectedOutcome: '45% reduction in unplanned factory downtime and 20% lower maintenance overhead.',
        status: 'submitted',
        studentId: student3._id,
        currentVersion: 1
      },
      {
        title: 'Urban Air Quality and Pollutant Dispersion Modeling Platform',
        domain: 'Environment',
        problemStatement: 'Standard municipal pollution reporting stations are spaced kilometers apart, masking localized pollution hotspots near schools and industrial complexes.',
        proposedSolution: 'A hyper-local environmental intelligence platform that combines low-cost PM2.5, NO2, and CO sensor arrays with weather data and computational fluid dynamics dispersion models.',
        targetUsers: 'City environmental health agencies, public schools, respiratory wellness researchers',
        technologies: ['IoT', 'Node.js', 'Express', 'PostGIS', 'Angular', 'Leaflet', 'Python'],
        keyFeatures: ['Hyper-local block-level air quality index map', 'Forecasted pollutant plume dispersion', 'Health warning alerts for vulnerable demographics', 'Historical clean-air compliance reports'],
        expectedOutcome: 'Accurate neighborhood-level air health tracking enabling targeted municipal clean air zones.',
        status: 'draft',
        studentId: student4._id,
        currentVersion: 1
      },
      {
        title: 'Ocean Plastic Debris Tracking and Removal Route Planner',
        domain: 'Environment',
        problemStatement: 'Marine cleanup non-profits operate with limited vessel fuel and struggle to locate moving plastic gyres and marine litter concentrations in coastal zones.',
        proposedSolution: 'A satellite remote-sensing analytics dashboard that identifies floating marine plastic patches from European Space Agency Sentinel-2 optical imagery and models ocean surface current drift.',
        targetUsers: 'Marine conservation organizations, coastal harbor authorities, oceanographic researchers',
        technologies: ['Python', 'GDAL', 'Satellite Optical API', 'Node.js', 'MongoDB', 'Angular', 'Mapbox GL'],
        keyFeatures: ['Satellite-derived marine plastic index maps', 'Ocean surface current drift trajectory predictor', 'Optimized cleanup vessel collection routes', 'Estimated plastic tonnage recovery metrics'],
        expectedOutcome: '3x increase in plastic tonnage collected per cleanup vessel nautical mile.',
        status: 'submitted',
        studentId: student2._id,
        currentVersion: 1
      }
    ];

    const createdProjects = [];
    for (const p of projectSeedData) {
      const proj = await Project.create(p);
      createdProjects.push(proj);

      // Create initial ProjectVersion
      await ProjectVersion.create({
        projectId: proj._id,
        versionNumber: proj.currentVersion,
        title: proj.title,
        problemStatement: proj.problemStatement,
        proposedSolution: proj.proposedSolution,
        targetUsers: proj.targetUsers,
        domain: proj.domain,
        technologies: proj.technologies,
        keyFeatures: proj.keyFeatures,
        expectedOutcome: proj.expectedOutcome,
        changeSummary: proj.currentVersion > 1 ? 'Enhanced architecture and added advanced modules' : 'Initial version submitted',
        createdBy: proj.studentId
      });
    }

    console.log(`[Seed] ${createdProjects.length} Projects and Versions created.`);

    // 3. Create Traceability records for the primary demo project (Project #0: Smart Waste)
    const demoProject = createdProjects[0];
    console.log('[Seed] Creating Traceability Tree for demo project:', demoProject.title);

    const req1 = await Requirement.create({
      projectId: demoProject._id,
      reqCode: 'REQ-001',
      title: 'Real-time Bin Fill Level Telemetry',
      description: 'The system shall ingest ultrasonic sensor telemetry every 5 minutes and store historical fill percentages.',
      priority: 'critical',
      status: 'completed'
    });

    const req2 = await Requirement.create({
      projectId: demoProject._id,
      reqCode: 'REQ-002',
      title: 'Automated Route Optimization Engine',
      description: 'The system shall compute the shortest travel path for garbage trucks covering all bins exceeding 80% capacity.',
      priority: 'high',
      status: 'in_progress'
    });

    const req3 = await Requirement.create({
      projectId: demoProject._id,
      reqCode: 'REQ-003',
      title: 'Municipal Driver Mobile Navigation View',
      description: 'Truck drivers shall have a responsive turn-by-turn map interface displaying assigned collection waypoints.',
      priority: 'medium',
      status: 'open'
    });

    const feat1 = await Feature.create({
      projectId: demoProject._id,
      requirementId: req1._id,
      code: 'FEAT-001',
      title: 'IoT Telemetry Ingestion REST & MQTT Endpoint',
      description: 'Express endpoint receiving authenticated payload { binId, fillLevel, batteryLevel, timestamp }',
      complexity: 'medium',
      status: 'implemented'
    });

    const feat2 = await Feature.create({
      projectId: demoProject._id,
      requirementId: req2._id,
      code: 'FEAT-002',
      title: 'Dijkstra and TSP Traveling Salesman Route Optimizer',
      description: 'Algorithm calculating nearest-neighbor route minimizing total road distance for prioritized bins.',
      complexity: 'complex',
      status: 'in_development'
    });

    const feat3 = await Feature.create({
      projectId: demoProject._id,
      requirementId: req3._id,
      code: 'FEAT-003',
      title: 'Interactive Leaflet Route Map Component',
      description: 'Angular standalone map displaying color-coded bins (green, yellow, red) and highlighted collection path.',
      complexity: 'medium',
      status: 'planned'
    });

    const tc1 = await TestCase.create({
      projectId: demoProject._id,
      featureId: feat1._id,
      requirementId: req1._id,
      code: 'TC-001',
      title: 'Verify valid telemetry ingestion and database persistence',
      description: 'Send synthetic ultrasonic sensor payload and assert MongoDB stores fill level correctly.',
      expectedResult: 'HTTP 200 OK returned and Project record updatedAt is refreshed.',
      status: 'passed'
    });

    const tc2 = await TestCase.create({
      projectId: demoProject._id,
      featureId: feat2._id,
      requirementId: req2._id,
      code: 'TC-002',
      title: 'Validate TSP route calculation with 10 simulated full bins',
      description: 'Supply 10 coordinate points exceeding 80% threshold and verify route sequence is calculated under 200ms.',
      expectedResult: 'Ordered list of waypoints generated with minimal total travel distance.',
      status: 'pending'
    });

    const iss1 = await Issue.create({
      projectId: demoProject._id,
      requirementId: req1._id,
      featureId: feat1._id,
      testCaseId: tc1._id,
      code: 'ISS-001',
      title: 'Telemetry timestamp timezone offset discrepancy',
      description: 'Sensors in UTC caused a 5.5 hour shift in peak-fill visual analytics graphs.',
      severity: 'minor',
      status: 'resolved'
    });

    const iss2 = await Issue.create({
      projectId: demoProject._id,
      requirementId: req2._id,
      featureId: feat2._id,
      testCaseId: tc2._id,
      code: 'ISS-002',
      title: 'Map routing fails when one-way street directions are violated',
      description: 'Generated collection path occasionally suggests illegal left turns on downtown one-way boulevards.',
      severity: 'major',
      status: 'open'
    });

    // 4. Create Pre-computed Analysis and Similarity for Demo Projects
    console.log('[Seed] Generating pre-computed analysis for key projects...');
    const geminiService = require('../services/gemini.service');
    const similarityService = require('../services/similarity.service');

    for (let i = 0; i < Math.min(createdProjects.length, 5); i++) {
      const p = createdProjects[i];
      await geminiService.analyzeProject(p, p.currentVersion);
      await similarityService.analyzeSimilarity(p, p.currentVersion);
    }

    // 5. Create Reviews and Comments
    console.log('[Seed] Creating demo faculty reviews and comments...');
    await Review.create({
      projectId: createdProjects[0]._id,
      facultyId: faculty1._id,
      versionNumber: 2,
      statusDecision: 'approved',
      comments: 'Excellent progression from Version 1 to Version 2. The mathematical formulation of the dynamic routing problem is well thought out, and the ultrasonic sensor telemetry architecture is robust and feasible. Approved for capstone final defense.',
      criteriaRatings: {
        problemClarity: 5,
        innovationNovelty: 4,
        technicalFeasibility: 5,
        societalImpact: 5
      }
    });

    await Review.create({
      projectId: createdProjects[1]._id,
      facultyId: faculty2._id,
      versionNumber: 1,
      statusDecision: 'under_review',
      comments: 'Very interesting campus adaptation of the smart waste concept. Notice how closely it correlates with Project #1 on the similarity engine. Please clearly articulate how your optical computer-vision sorting differentiator compares against pure ultrasonic fill-level approaches.',
      criteriaRatings: {
        problemClarity: 4,
        innovationNovelty: 4,
        technicalFeasibility: 4,
        societalImpact: 4
      }
    });

    await Comment.create({
      projectId: createdProjects[0]._id,
      authorId: faculty1._id,
      authorRole: 'faculty',
      content: 'Make sure your final presentation includes an analysis of network battery drain when sensors ping over cellular versus LoRaWAN.'
    });

    await Comment.create({
      projectId: createdProjects[0]._id,
      authorId: student3._id,
      authorRole: 'student',
      content: 'Thank you Professor Thorne! We simulated deep sleep intervals in Version 2, extending field battery life to approximately 14 months.'
    });

    // Notifications
    await Notification.create({
      recipientId: student3._id,
      senderId: faculty1._id,
      projectId: createdProjects[0]._id,
      type: 'review_added',
      title: 'Project Approved! 🎉',
      message: 'Dr. Aris Thorne has officially approved your project "Smart Waste Management and Route Optimization System".',
      link: `/projects/${createdProjects[0]._id}`
    });

    await Notification.create({
      recipientId: student1._id,
      senderId: faculty2._id,
      projectId: createdProjects[1]._id,
      type: 'review_added',
      title: 'Review Note Added',
      message: 'Prof. Maya Raman posted feedback on your project "Campus Automated Waste Sorting".',
      link: `/projects/${createdProjects[1]._id}`
    });

    console.log('========================================================');
    console.log('[Seed] Database seeding completed successfully!');
    console.log('User Credentials for Testing:');
    console.log('Admin:   admin@idealens.edu   / Password123!');
    console.log('Faculty: faculty@idealens.edu / Password123!');
    console.log('Student: student@idealens.edu / Password123!');
    console.log('========================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
