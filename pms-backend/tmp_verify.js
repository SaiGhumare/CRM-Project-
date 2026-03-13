const mongoose = require('mongoose');
const { getAllGroups } = require('./controllers/groupController');
const { getAllStudents } = require('./controllers/studentController');
const { getAllAbstracts } = require('./controllers/abstractController');
const User = require('./models/User');

const run_tests = async () => {
  await mongoose.connect('mongodb://localhost:27017/pms_db');
  console.log('Connected to MongoDB');

  // Find a mentor in the DB
  const mentor = await User.findOne({ role: 'mentor' });
  if (!mentor) {
    console.log('No mentor found in DB to test with.');
    mongoose.disconnect();
    return;
  }
  console.log(`Testing with Mentor: ${mentor.name} (${mentor._id})`);

  // Mock req and res for Admin (no role restriction)
  const reqAdmin = { query: {}, user: { id: mentor._id, role: 'admin' } };
  
  // Mock req and res for Mentor
  const reqMentor = { query: {}, user: { id: mentor._id, role: 'mentor' } };

  // Helper for res
  const createMockRes = (onEnd) => {
    return {
      json: (data) => onEnd(data),
      status: (code) => ({ json: (data) => onEnd({ code, data }) })
    };
  };

  console.log('\n--- Testing Groups ---');
  await new Promise(resolve => {
    getAllGroups(reqAdmin, createMockRes(data => {
      console.log(`Admin sees ${data.count} groups.`);
      resolve();
    }));
  });

  await new Promise(resolve => {
    getAllGroups(reqMentor, createMockRes(data => {
      console.log(`Mentor sees ${data.count} groups.`);
      resolve();
    }));
  });

  console.log('\n--- Testing Students ---');
  await new Promise(resolve => {
    getAllStudents(reqAdmin, createMockRes(data => {
      console.log(`Admin sees ${data.total} students.`);
      resolve();
    }));
  });

  await new Promise(resolve => {
    getAllStudents(reqMentor, createMockRes(data => {
      console.log(`Mentor sees ${data.total} students.`);
      resolve();
    }));
  });

  console.log('\n--- Testing Abstracts ---');
  await new Promise(resolve => {
    getAllAbstracts(reqAdmin, createMockRes(data => {
      console.log(`Admin sees ${data.count} abstracts.`);
      resolve();
    }));
  });

  await new Promise(resolve => {
    getAllAbstracts(reqMentor, createMockRes(data => {
      console.log(`Mentor sees ${data.count} abstracts.`);
      resolve();
    }));
  });

  mongoose.disconnect();
};

run_tests().catch(console.error);
