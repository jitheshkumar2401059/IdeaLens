const mongoose = require('mongoose');

async function audit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/idealens_db');
  const db = mongoose.connection.db;

  const totalProjects = await db.collection('projects').countDocuments();
  const activeProjects = await db.collection('projects').countDocuments({ isArchived: false });
  const archivedProjects = await db.collection('projects').countDocuments({ isArchived: true });

  const student = await db.collection('users').findOne({ email: 'student@idealens.edu' });
  const faculty = await db.collection('users').findOne({ email: 'faculty@idealens.edu' });
  const admin = await db.collection('users').findOne({ email: 'admin@idealens.edu' });

  const studentAll = await db.collection('projects').countDocuments({ studentId: student._id });
  const studentActive = await db.collection('projects').countDocuments({ studentId: student._id, isArchived: false });
  const studentArchived = await db.collection('projects').countDocuments({ studentId: student._id, isArchived: true });

  const facultyAll = faculty ? await db.collection('projects').countDocuments({ studentId: faculty._id }) : 0;
  const adminAll = admin ? await db.collection('projects').countDocuments({ studentId: admin._id }) : 0;

  console.log('=== PROJECTS DOCUMENT SUMMARY ===');
  console.log('Total documents in projects collection:', totalProjects);
  console.log('Active projects (isArchived: false):', activeProjects);
  console.log('Archived projects (isArchived: true):', archivedProjects);
  console.log('Student user ID:', student._id.toString());
  console.log('All student projects (including archived):', studentAll);
  console.log('Active student projects (isArchived: false):', studentActive);
  console.log('Archived student projects (isArchived: true):', studentArchived);
  console.log('Projects with studentId = faculty._id:', facultyAll);
  console.log('Projects with studentId = admin._id:', adminAll);

  console.log('\n=== ALL ARCHIVED PROJECTS ===');
  const archivedList = await db.collection('projects').find({ isArchived: true }).toArray();
  archivedList.forEach(p => console.log(' - Title:', p.title, '| ID:', p._id, '| studentId:', p.studentId, '| status:', p.status));

  console.log('\n=== STATUS DISTRIBUTION (ALL PROJECTS) ===');
  const statusAll = await db.collection('projects').aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]).toArray();
  console.log(statusAll);

  console.log('\n=== STATUS DISTRIBUTION (ACTIVE PROJECTS) ===');
  const statusActive = await db.collection('projects').aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]).toArray();
  console.log(statusActive);

  console.log('\n=== STATUS DISTRIBUTION (DEMO STUDENT ACTIVE PROJECTS) ===');
  const statusStudent = await db.collection('projects').aggregate([
    { $match: { studentId: student._id, isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]).toArray();
  console.log(statusStudent);

  console.log('\n=== PROJECTS OWNED BY OTHER USERS (ACTIVE) ===');
  const otherUsersProjects = await db.collection('projects').aggregate([
    { $match: { studentId: { $ne: student._id }, isArchived: false } },
    { $group: { _id: '$studentId', count: { $sum: 1 } } }
  ]).toArray();
  for (const o of otherUsersProjects) {
    const u = await db.collection('users').findOne({ _id: o._id });
    console.log(' User:', u ? `${u.name} <${u.email}> (${u.role})` : 'Unknown User', '| ID:', o._id, '| Active count:', o.count);
  }

  await mongoose.disconnect();
}

audit();
