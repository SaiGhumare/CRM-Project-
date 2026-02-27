const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const StudentGroup = require('./models/StudentGroup');
const Abstract = require('./models/Abstract');
const Notice = require('./models/Notice');
const ITR = require('./models/ITR');

dotenv.config();

// ─── Seed Data ───────────────────────────────────────────────────────────

// Admin
const adminData = {
  name: 'Admin',
  email: 'admin@sandip.edu',
  password: 'admin123',
  role: 'admin',
  department: 'CO',
};

// ITR Coordinator
const itrCoordinatorData = {
  name: 'ITR Coordinator',
  email: 'itr@sandip.edu',
  password: 'itr123',
  role: 'itr_coordinator',
  department: 'CO',
};

// Mentors (from TYCO CPP guide names)
const mentorsData = [
  { name: 'Prof. V.B. Ohol', email: 'vb.ohol@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. R.V. Deshpande', email: 'rv.deshpande@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. P.B. Datir', email: 'pb.datir@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. Y.N. Jadhav', email: 'yn.jadhav@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. R.S. Thete', email: 'rs.thete@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. G.P. Bharne', email: 'gp.bharne@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. R.K. Ghate', email: 'rk.ghate@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Prof. Y.D. Jadhav', email: 'yd.jadhav@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
];

// Students (from Roll Call List 2025-26)
const studentsData = [
  { rollNumber: '1', enrollmentNumber: '23611780171', name: 'More Lalit Dilip' },
  { rollNumber: '2', enrollmentNumber: '23611780172', name: 'Jagzap Anil Nana' },
  { rollNumber: '3', enrollmentNumber: '23611780173', name: 'Nikam Niranjan Satish' },
  { rollNumber: '4', enrollmentNumber: '23611780174', name: 'Bidait Vaibhav Balasaheb' },
  { rollNumber: '5', enrollmentNumber: '23611780175', name: 'Bhabad Sanika Jagadish' },
  { rollNumber: '6', enrollmentNumber: '23611780176', name: 'Jadhav Rahul Devendra' },
  { rollNumber: '7', enrollmentNumber: '23611780177', name: 'Surve Parth Yogesh' },
  { rollNumber: '8', enrollmentNumber: '23611780178', name: 'Hande Saloni Prabhakar' },
  { rollNumber: '9', enrollmentNumber: '23611780179', name: 'Pingalkar Vaishnavi Vijay' },
  { rollNumber: '10', enrollmentNumber: '23611780180', name: 'Deore Suraj Rajendra' },
  { rollNumber: '11', enrollmentNumber: '23611780181', name: 'Netkar Yash Digambar' },
  { rollNumber: '12', enrollmentNumber: '23611780182', name: 'Minde Ashutosh Subhash' },
  { rollNumber: '13', enrollmentNumber: '23611780183', name: 'Chaudhari Chirag Sanjay' },
  { rollNumber: '14', enrollmentNumber: '23611780184', name: 'Ahirrao Sarvesh Sunil' },
  { rollNumber: '15', enrollmentNumber: '23611780185', name: 'Shejole Anshu Sunil' },
  { rollNumber: '16', enrollmentNumber: '23611780186', name: 'Shaikh Farheen Hussain Mohammad' },
  { rollNumber: '17', enrollmentNumber: '23611780187', name: 'Pure Shreyas Subhash' },
  { rollNumber: '18', enrollmentNumber: '23611780188', name: 'Gangurde Hemant Hari' },
  { rollNumber: '19', enrollmentNumber: '23611780189', name: 'Kor Lokesh Satish' },
  { rollNumber: '20', enrollmentNumber: '23611780190', name: 'Deore Vaishnavi Dilip' },
  { rollNumber: '21', enrollmentNumber: '23611780191', name: 'Mahajan Radhika Kantilal' },
  { rollNumber: '22', enrollmentNumber: '23611780192', name: 'Deshmane Purva Santosh' },
  { rollNumber: '23', enrollmentNumber: '23611780193', name: 'Chitte Grishma Ravindra' },
  { rollNumber: '24', enrollmentNumber: '23611780194', name: 'Jadhav Shubham Tatyabhau' },
  { rollNumber: '25', enrollmentNumber: '23611780195', name: 'Pawar Karansing Jabbarsing' },
  { rollNumber: '26', enrollmentNumber: '23611780196', name: 'Gadhari Kirti Dattu' },
  { rollNumber: '27', enrollmentNumber: '23611780197', name: 'More Aditya Sanjay' },
  { rollNumber: '28', enrollmentNumber: '23611780198', name: 'Dhivare Bhavesh Gautam' },
  { rollNumber: '29', enrollmentNumber: '23611780199', name: 'Pratik Rajendra Samudre' },
  { rollNumber: '30', enrollmentNumber: '23611780200', name: 'Ahirrao Manaswi Anil' },
  { rollNumber: '31', enrollmentNumber: '23611780201', name: 'More Swapnil Satish' },
  { rollNumber: '32', enrollmentNumber: '23611780203', name: 'Salve Soham Gajanan' },
  { rollNumber: '33', enrollmentNumber: '23611780204', name: 'Ghodsare Roshan Arun' },
  { rollNumber: '34', enrollmentNumber: '23611780205', name: 'Ahire Charudatta Subhash' },
  { rollNumber: '35', enrollmentNumber: '23611780206', name: 'Bankar Vishakha Ranjeet' },
  { rollNumber: '36', enrollmentNumber: '23611780207', name: 'Pawar Pooja Reshmabai' },
  { rollNumber: '37', enrollmentNumber: '23611780208', name: 'Saindane Sejal Pankaj' },
  { rollNumber: '38', enrollmentNumber: '23611780210', name: 'Sapkal Somesh Manohar' },
  { rollNumber: '39', enrollmentNumber: '23611780211', name: 'Mandwade Chaitanya Vijay' },
  { rollNumber: '40', enrollmentNumber: '23611780212', name: 'Suryawanshi Pratik Madhukar' },
  { rollNumber: '41', enrollmentNumber: '23611780213', name: 'Gujare Ambika Shantaram' },
  { rollNumber: '42', enrollmentNumber: '23611780214', name: 'Karpe Payal Pravin' },
  { rollNumber: '43', enrollmentNumber: '23611780215', name: 'Aher Aniket Laxman' },
  { rollNumber: '44', enrollmentNumber: '23611780216', name: 'Atharva Rajendra Patil' },
  { rollNumber: '45', enrollmentNumber: '23611780217', name: 'Raundal Vrushabh Umesh' },
  { rollNumber: '46', enrollmentNumber: '23611780219', name: 'Shelar Swarup Sadashiv' },
  { rollNumber: '47', enrollmentNumber: '23611780220', name: 'Sanchit Vijay Bhagwat' },
  { rollNumber: '48', enrollmentNumber: '23611780221', name: 'Aryan Manoj Mali' },
  { rollNumber: '49', enrollmentNumber: '23611780222', name: 'Sakshi Pramod Patil' },
  { rollNumber: '50', enrollmentNumber: '23611780223', name: 'Wagh Aryan Dinesh' },
  { rollNumber: '51', enrollmentNumber: '23611780224', name: 'Pushkar Mishra' },
  { rollNumber: '52', enrollmentNumber: '23611780227', name: 'Pandit Jaytesh Jogeshwar' },
  { rollNumber: '53', enrollmentNumber: '23611780228', name: 'Patel Mahi Urvish' },
  { rollNumber: '54', enrollmentNumber: '23611780230', name: 'Vrushali Vinod Patil' },
  { rollNumber: '55', enrollmentNumber: '23611780231', name: 'Sonawane Soham Sopan' },
  { rollNumber: '56', enrollmentNumber: '23611780232', name: 'Desale Gauri Raosaheb' },
  { rollNumber: '57', enrollmentNumber: '23611780233', name: 'Barhate Pranjal Madhav' },
  { rollNumber: '58', enrollmentNumber: '23611780234', name: 'Kanade Sarthak Sushil' },
  { rollNumber: '59', enrollmentNumber: '23611780235', name: 'Nigal Khushi Dnyaneshwar' },
  { rollNumber: '60', enrollmentNumber: '23611780236', name: 'Galankar Arpita Sanjay' },
  { rollNumber: '61', enrollmentNumber: '23611780237', name: 'Deore Gayatri Ramdas' },
  { rollNumber: '62', enrollmentNumber: '24611780001', name: 'Thakare Komal Atamaram' },
  { rollNumber: '63', enrollmentNumber: '24611780002', name: 'Khare Ashlesha Yogesh' },
  { rollNumber: '64', enrollmentNumber: '24611780003', name: 'Daware Sakshi Harishchandra' },
  { rollNumber: '65', enrollmentNumber: '24611780004', name: 'Jadhav Yashswini Rajendra' },
  { rollNumber: '66', enrollmentNumber: '24611780005', name: 'Sonawane Anushka Pandit' },
  { rollNumber: '67', enrollmentNumber: '24611780006', name: 'Warke Sahil Gunwant' },
  { rollNumber: '68', enrollmentNumber: '24611780007', name: 'Pagar Dnyaneshwari Padmakar' },
];

// Groups (students will be assigned by roll number: 4 students per group)
// Group 1 = roll 1-4, Group 2 = roll 5-8, etc.
const groupsConfig = [
  { name: 'G1', members: [0, 1, 2, 3], guideName: 'Prof. V.B. Ohol' },
  { name: 'G2', members: [4, 5, 6, 7], guideName: 'Prof. R.V. Deshpande' },
  { name: 'G3', members: [8, 9, 10, 11], guideName: 'Prof. R.V. Deshpande' },
  { name: 'G4', members: [12, 13, 14, 15], guideName: 'Prof. P.B. Datir' },
  { name: 'G5', members: [16, 17, 18, 19], guideName: 'Prof. V.B. Ohol' },
  { name: 'G6', members: [20, 21, 22, 23], guideName: 'Prof. Y.N. Jadhav' },
  { name: 'G7', members: [24, 25, 26, 27], guideName: 'Prof. Y.N. Jadhav' },
  { name: 'G8', members: [28, 29, 30, 31], guideName: 'Prof. V.B. Ohol' },
  { name: 'G9', members: [32, 33, 34, 35], guideName: 'Prof. R.S. Thete' },
  { name: 'G10', members: [36, 37, 38, 39], guideName: 'Prof. R.V. Deshpande' },
  { name: 'G11', members: [40, 41, 42, 43], guideName: 'Prof. Y.N. Jadhav' },
  { name: 'G12', members: [44, 45, 46, 47], guideName: 'Prof. G.P. Bharne' },
  { name: 'G13', members: [48, 49, 50, 51], guideName: 'Prof. G.P. Bharne' },
  { name: 'G14', members: [52, 53, 54, 55], guideName: 'Prof. R.V. Deshpande' },
  { name: 'G15', members: [56, 57, 58, 59], guideName: 'Prof. R.K. Ghate' },
  { name: 'G16', members: [60, 61, 62, 63], guideName: 'Prof. P.B. Datir' },
  { name: 'G17', members: [64, 65, 66, 67], guideName: 'Prof. Y.D. Jadhav' },
];

// ─── Seed Function ───────────────────────────────────────────────────────

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...\n');

    // ── Clear all collections ──
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await StudentGroup.deleteMany({});
    await Abstract.deleteMany({});
    await Notice.deleteMany({});
    await ITR.deleteMany({});
    console.log('✓ All collections cleared\n');

    // ── 1. Create Admin ──
    const admin = await User.create(adminData);
    console.log(`✓ Admin created: ${admin.email}`);

    // ── 2. Create ITR Coordinator ──
    const itrCoord = await User.create(itrCoordinatorData);
    console.log(`✓ ITR Coordinator created: ${itrCoord.email}`);

    // ── 3. Create Mentors ──
    const mentors = [];
    for (const mentorData of mentorsData) {
      const mentor = await User.create(mentorData);
      mentors.push(mentor);
      console.log(`✓ Mentor created: ${mentor.name} (${mentor.email})`);
    }
    console.log(`\n✓ ${mentors.length} mentors created\n`);

    // ── 4. Create Students ──
    const students = [];
    for (const sd of studentsData) {
      const emailName = sd.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
      const student = await User.create({
        name: sd.name,
        email: `${emailName}@sandip.edu`,
        password: 'student123',
        role: 'student',
        enrollmentNumber: sd.enrollmentNumber,
        rollNumber: sd.rollNumber,
        department: 'CO',
        className: 'TY Diploma',
        division: 'A',
      });
      students.push(student);
    }
    console.log(`✓ ${students.length} students created\n`);

    // ── 5. Create Groups & Assign Members ──
    const groups = [];
    for (const gc of groupsConfig) {
      const memberIds = gc.members.map(idx => students[idx]._id);
      const mentor = mentors.find(m => m.name === gc.guideName);

      const group = await StudentGroup.create({
        name: gc.name,
        projectGuide: gc.guideName,
        mentorId: mentor ? mentor._id : undefined,
        members: memberIds,
        academicYear: '2025-26',
        department: 'CO',
      });

      // Update each member's groupId
      await User.updateMany(
        { _id: { $in: memberIds } },
        { groupId: group._id }
      );

      groups.push(group);
      console.log(`✓ Group ${gc.name}: ${gc.members.length} members, guide: ${gc.guideName}`);
    }
    console.log(`\n✓ ${groups.length} groups created\n`);

    // ── 6. Create Sample Abstracts ──
    const abstract1 = await Abstract.create({
      title: 'Smart Campus Navigation System',
      description: 'A mobile-friendly web app that helps students navigate across the Sandip Polytechnic campus using indoor maps and GPS.',
      groupId: groups[0]._id,
      submittedBy: students[0]._id,
      status: 'pending',
    });

    const abstract2 = await Abstract.create({
      title: 'Online Lab Booking System',
      description: 'A web portal to allow students to book computer lab time slots, reducing conflicts and improving resource utilization.',
      groupId: groups[1]._id,
      submittedBy: students[4]._id,
      status: 'approved',
      feedback: 'Good concept. Please proceed with implementation.',
      reviewedBy: mentors[1]._id,
      reviewedAt: new Date(),
    });

    console.log(`✓ 2 sample abstracts created\n`);

    // ── 7. Create Sample Notices ──
    await Notice.create({
      title: 'Project Abstract Submission Deadline',
      purpose: 'All groups must submit their project abstracts by 15th March 2026. Late submissions will not be accepted.',
      startDate: new Date('2026-03-01'),
      dueDate: new Date('2026-03-15'),
      type: 'manual',
      createdBy: admin._id,
      sentToStudents: true,
    });

    await Notice.create({
      title: 'Weekly Progress Report Format',
      purpose: 'Students are required to follow the standard format for weekly diary submissions. Refer to the attached guidelines.',
      type: 'manual',
      createdBy: admin._id,
      sentToStudents: true,
      sentToGuides: true,
    });

    console.log(`✓ 2 sample notices created\n`);

    // ── 8. Create Sample ITR Records ──
    await ITR.create({
      studentId: students[0]._id,
      companyName: 'TechSoft Solutions Pvt. Ltd.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-07-31'),
      status: 'completed',
      coordinatorId: itrCoord._id,
      dailyDetails: [
        { date: new Date('2025-06-01'), description: 'Orientation and setup of development environment', hours: 6 },
        { date: new Date('2025-06-02'), description: 'Introduction to company tech stack and codebase', hours: 7 },
      ],
    });

    await ITR.create({
      studentId: students[4]._id,
      companyName: 'DigiWeb Services',
      startDate: new Date('2025-07-01'),
      status: 'ongoing',
      coordinatorId: itrCoord._id,
    });

    console.log(`✓ 2 sample ITR records created\n`);

    // ── Summary ──
    console.log('═══════════════════════════════════════════');
    console.log('  SEED COMPLETE — Summary');
    console.log('═══════════════════════════════════════════');
    console.log(`  Admin:           1  (admin@sandip.edu / admin123)`);
    console.log(`  ITR Coordinator: 1  (itr@sandip.edu / itr123)`);
    console.log(`  Mentors:         ${mentors.length}  (password: mentor123)`);
    console.log(`  Students:        ${students.length} (password: student123)`);
    console.log(`  Groups:          ${groups.length}`);
    console.log(`  Abstracts:       2`);
    console.log(`  Notices:         2`);
    console.log(`  ITR Records:     2`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
