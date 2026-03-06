const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const StudentGroup = require('./models/StudentGroup');
const Abstract = require('./models/Abstract');
const Document = require('./models/Document');
const Certificate = require('./models/Certificate');
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

// Mentors (from Project Group CSV — exact guide names)
const mentorsData = [
  { name: 'Mr. V.B. Ohol', email: 'vb.ohol@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Mrs. R.V. Deshpande', email: 'rv.deshpande@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Mrs. P.B. Datir', email: 'pb.datir@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Mr. Y.N. Jadhav', email: 'yn.jadhav@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Mrs. R.S. Thete', email: 'rs.thete@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Mrs. R.K. Ghate', email: 'rk.ghate@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
  { name: 'Mrs. V.A. Wagh', email: 'va.wagh@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' },
];

// Students (from Roll Call List 2025-26) — with actual emails from CSV
const studentsData = [
  { rollNumber: '1', enrollmentNumber: '23611780171', name: 'More Lalit Dilip', email: 'lalitmore456@gmail.com' },
  { rollNumber: '2', enrollmentNumber: '23611780172', name: 'Jagzap Anil Nana', email: 'aniljagzap0@gmail.com' },
  { rollNumber: '3', enrollmentNumber: '23611780173', name: 'Nikam Niranjan Satish', email: 'satishnikam989@gmail.com' },
  { rollNumber: '4', enrollmentNumber: '23611780174', name: 'Bidait Vaibhav Balasaheb', email: 'vaibhavbidait@gmail.com' },
  { rollNumber: '5', enrollmentNumber: '23611780175', name: 'Bhabad Sanika Jagadish', email: 'bhabadsanika2007@gmail.com' },
  { rollNumber: '6', enrollmentNumber: '23611780176', name: 'Jadhav Rahul Devendra', email: 'golujadhav328@gmail.com' },
  { rollNumber: '7', enrollmentNumber: '23611780177', name: 'Surve Parth Yogesh', email: 'surveparth611@gmail.com' },
  { rollNumber: '8', enrollmentNumber: '23611780178', name: 'Hande Saloni Prabhakar', email: 'salonihande111@gmail.com' },
  { rollNumber: '9', enrollmentNumber: '23611780179', name: 'Pingalkar Vaishnavi Vijay', email: 'vaishnavipingalkar6783@gmail.com' },
  { rollNumber: '10', enrollmentNumber: '23611780180', name: 'Deore Suraj Rajendra', email: 'surajdavre431@gmail.com' },
  { rollNumber: '11', enrollmentNumber: '23611780181', name: 'Netkar Yash Digambar', email: 'yashnetkar@gmail.com' },
  { rollNumber: '12', enrollmentNumber: '23611780182', name: 'Minde Ashutosh Subhash', email: 'subhashminde5@gmail.com' },
  { rollNumber: '13', enrollmentNumber: '23611780183', name: 'Chaudhari Chirag Sanjay', email: 'chiragchaudhari213@gmail.com' },
  { rollNumber: '14', enrollmentNumber: '23611780184', name: 'Ahirrao Sarvesh Sunil', email: 'sarveshahirrao11@gmail.com' },
  { rollNumber: '15', enrollmentNumber: '23611780185', name: 'Shejole Anshu Sunil', email: 'anshushejole@gmail.com' },
  { rollNumber: '16', enrollmentNumber: '23611780186', name: 'Shaikh Farheen Hussain Mohammad', email: 'farheen040407@gmail.com' },
  { rollNumber: '17', enrollmentNumber: '23611780187', name: 'Pure Shreyas Subhash', email: 'atharvapure@gmail.com' },
  { rollNumber: '18', enrollmentNumber: '23611780188', name: 'Gangurde Hemant Hari', email: 'hemantgangurde215@gmail.com' },
  { rollNumber: '19', enrollmentNumber: '23611780189', name: 'Kor Lokesh Satish', email: 'korlokesh64@gmail.com' },
  { rollNumber: '20', enrollmentNumber: '23611780190', name: 'Deore Vaishnavi Dilip', email: 'vaishnavideore2007@gmail.com' },
  { rollNumber: '21', enrollmentNumber: '23611780191', name: 'Mahajan Radhika Kantilal', email: 'radhikamahajan8811@gmail.com' },
  { rollNumber: '22', enrollmentNumber: '23611780192', name: 'Deshmane Purva Santosh', email: 'deshmanepurva6@gmail.com' },
  { rollNumber: '23', enrollmentNumber: '23611780193', name: 'Chitte Grishma Ravindra', email: 'ravindra.chitte88@gmail.com' },
  { rollNumber: '24', enrollmentNumber: '23611780194', name: 'Jadhav Shubham Tatyabhau', email: 'sj43668@gmail.com' },
  { rollNumber: '25', enrollmentNumber: '23611780195', name: 'Pawar Karansing Jabbarsing', email: 'pawarjabbarsing@gmail.com' },
  { rollNumber: '26', enrollmentNumber: '23611780196', name: 'Gadhari Kirti Dattu', email: 'kiratigadhari@gmail.com' },
  { rollNumber: '27', enrollmentNumber: '23611780197', name: 'More Aditya Sanjay', email: 'moreaditya084@gmail.com' },
  { rollNumber: '28', enrollmentNumber: '23611780198', name: 'Dhivare Bhavesh Gautam', email: 'bhaveshdhivare990@gmail.com' },
  { rollNumber: '29', enrollmentNumber: '23611780199', name: 'Pratik Rajendra Samudre', email: 'samudrepratik657@gmail.com' },
  { rollNumber: '30', enrollmentNumber: '23611780200', name: 'Ahirrao Manaswi Anil', email: 'manaswiahirrao2912@gmail.com' },
  { rollNumber: '31', enrollmentNumber: '23611780201', name: 'More Swapnil Satish', email: 'swapnilmore9322@gmail.com' },
  { rollNumber: '32', enrollmentNumber: '23611780203', name: 'Salve Soham Gajanan', email: 'sohamsalve2007@gmail.com' },
  { rollNumber: '33', enrollmentNumber: '23611780204', name: 'Ghodsare Roshan Arun', email: 'roshanghodsare819@gmail.com' },
  { rollNumber: '34', enrollmentNumber: '23611780205', name: 'Ahire Charudatta Subhash', email: 'charudattaahire14@gmail.com' },
  { rollNumber: '35', enrollmentNumber: '23611780206', name: 'Bankar Vishakha Ranjeet', email: 'ranjitbankar358@gmail.com' },
  { rollNumber: '36', enrollmentNumber: '23611780207', name: 'Pawar Pooja Reshmabai', email: 'akashpawar722@gmail.com' },
  { rollNumber: '37', enrollmentNumber: '23611780208', name: 'Saindane Sejal Pankaj', email: 'diyasaindane2005@gmail.com' },
  { rollNumber: '38', enrollmentNumber: '23611780210', name: 'Sapkal Somesh Manohar', email: 'abhaykartule2618@gmail.com' },
  { rollNumber: '39', enrollmentNumber: '23611780211', name: 'Mandwade Chaitanya Vijay', email: 'someshsapkal30@gmail.com' },
  { rollNumber: '40', enrollmentNumber: '23611780212', name: 'Suryawanshi Pratik Madhukar', email: 'mandawdechaitanya@gmail.com' },
  { rollNumber: '41', enrollmentNumber: '23611780213', name: 'Gujare Ambika Shantaram', email: 'surywanshipratik23@gmail.com' },
  { rollNumber: '42', enrollmentNumber: '23611780214', name: 'Karpe Payal Pravin', email: 'pgugre@gmail.com' },
  { rollNumber: '43', enrollmentNumber: '23611780215', name: 'Aher Aniket Laxman', email: 'karpepayal98@gmail.com' },
  { rollNumber: '44', enrollmentNumber: '23611780216', name: 'Atharva Rajendra Patil', email: 'aniketaher05@gmail.com' },
  { rollNumber: '45', enrollmentNumber: '23611780217', name: 'Raundal Vrushabh Umesh', email: 'patilvidikem1@gmail.com' },
  { rollNumber: '46', enrollmentNumber: '23611780219', name: 'Shelar Swarup Sadashiv', email: 'vrushabhraundal@gmail.com' },
  { rollNumber: '47', enrollmentNumber: '23611780220', name: 'Sanchit Vijay Bhagwat', email: 'vijaybhaagwat@gmail.com' },
  { rollNumber: '48', enrollmentNumber: '23611780221', name: 'Aryan Manoj Mali', email: 'aaryanmali756@gmail.com' },
  { rollNumber: '49', enrollmentNumber: '23611780222', name: 'Sakshi Pramod Patil', email: 'sakshipatil@gmail.com' },
  { rollNumber: '50', enrollmentNumber: '23611780223', name: 'Wagh Aryan Dinesh', email: 'aryanw108@gmail.com' },
  { rollNumber: '51', enrollmentNumber: '23611780224', name: 'Pushkar Mishra', email: 'satyamthakur15490@gmail.com' },
  { rollNumber: '52', enrollmentNumber: '23611780227', name: 'Pandit Jaytesh Jogeshwar', email: 'jayteshp@gmail.com' },
  { rollNumber: '53', enrollmentNumber: '23611780228', name: 'Patel Mahi Urvish', email: 'purvish15576@gmail.com' },
  { rollNumber: '54', enrollmentNumber: '23611780230', name: 'Vrushali Vinod Patil', email: 'vrushalipatil@gmail.com' },
  { rollNumber: '55', enrollmentNumber: '23611780231', name: 'Sonawane Soham Sopan', email: 'sohamdeshmukh7031@gmail.com' },
  { rollNumber: '56', enrollmentNumber: '23611780232', name: 'Desale Gauri Raosaheb', email: 'gauridesale10@gmail.com' },
  { rollNumber: '57', enrollmentNumber: '23611780233', name: 'Barhate Pranjal Madhav', email: 'pratikshabarahate8@gmail.com' },
  { rollNumber: '58', enrollmentNumber: '23611780234', name: 'Kanade Sarthak Sushil', email: 'sarthakkanade14@gmail.com' },
  { rollNumber: '59', enrollmentNumber: '23611780235', name: 'Nigal Khushi Dnyaneshwar', email: 'nigkhushi9@gmail.com' },
  { rollNumber: '60', enrollmentNumber: '23611780236', name: 'Galankar Arpita Sanjay', email: 'arpitagalankar07@gmail.com' },
  { rollNumber: '61', enrollmentNumber: '23611780237', name: 'Deore Gayatri Ramdas', email: 'ramdasdeore52@gmail.com' },
  { rollNumber: '62', enrollmentNumber: '24611780001', name: 'Thakare Komal Atamaram', email: 'komalthakare9579@gmail.com' },
  { rollNumber: '63', enrollmentNumber: '24611780002', name: 'Khare Ashlesha Yogesh', email: 'ashleshakhare@gmail.com' },
  { rollNumber: '64', enrollmentNumber: '24611780003', name: 'Daware Sakshi Harishchandra', email: 'dawaresakshi647@gmail.com' },
  { rollNumber: '65', enrollmentNumber: '24611780004', name: 'Jadhav Yashswini Rajendra', email: 'yashswinijadhav9021@gmail.com' },
  { rollNumber: '66', enrollmentNumber: '24611780005', name: 'Sonawane Anushka Pandit', email: 'anushkasonawane.2500@gmail.com' },
  { rollNumber: '67', enrollmentNumber: '24611780006', name: 'Warke Sahil Gunwant', email: 'sahilwarkw26@gmail.com' },
  { rollNumber: '68', enrollmentNumber: '24611780007', name: 'Pagar Dnyaneshwari Padmakar', email: 'dnyaneshwari1229@gmail.com' },
];

// Groups config from Project Group CSV — members referenced by rollNumber
// Roll numbers map to studentsData array index: rollNumber "1" => index 0, "2" => index 1, etc.
const rollToIndex = {};
studentsData.forEach((s, i) => { rollToIndex[s.rollNumber] = i; });

const groupsConfig = [
  { name: 'G1',  rollNos: ['47','38','27','14'], guideName: 'Mr. V.B. Ohol',       projectTitle: 'Smart Salon Management' },
  { name: 'G2',  rollNos: ['13','32','43'],       guideName: 'Mrs. R.V. Deshpande', projectTitle: 'Automated Counting and Sorting using Image Segmentation and Detection' },
  { name: 'G3',  rollNos: ['58','15','2','12'],   guideName: 'Mrs. R.S. Thete',     projectTitle: 'Platform for Events' },
  { name: 'G4',  rollNos: ['34','6','18','25'],    guideName: 'Mrs. R.K. Ghate',     projectTitle: 'NBA-SAR Automation Platform of Point-4 (Student Performance)' },
  { name: 'G5',  rollNos: ['44','29','51','24'],   guideName: 'Mrs. R.V. Deshpande', projectTitle: 'Block Chain Technology' },
  { name: 'G6',  rollNos: ['19','46','4','31'],    guideName: 'Mrs. R.S. Thete',     projectTitle: 'Digital Animal Market Platform' },
  { name: 'G7',  rollNos: ['11','3','17','52'],    guideName: 'Mrs. R.K. Ghate',     projectTitle: 'Virtual Queue Management System' },
  { name: 'G8',  rollNos: ['22','60'],             guideName: 'Mrs. P.B. Datir',     projectTitle: 'Project Management System' },
  { name: 'G9',  rollNos: ['37','50','55','10'],   guideName: 'Mrs. V.A. Wagh',      projectTitle: 'Digital Garbage Management System' },
  { name: 'G10', rollNos: ['8','16','59','61'],    guideName: 'Mr. Y.N. Jadhav',     projectTitle: 'OBE Tracking System (Point-3)' },
  { name: 'G11', rollNos: ['49','41','54'],        guideName: 'Mrs. P.B. Datir',     projectTitle: 'Smart Tourist Safety Monitoring and Incident Response System' },
  { name: 'G12', rollNos: ['9','30','26','20'],    guideName: 'Mr. Y.N. Jadhav',     projectTitle: 'AI-Based Smart Study Planner' },
  { name: 'G13', rollNos: ['62','65','67','68'],   guideName: 'Mr. V.B. Ohol',       projectTitle: 'Time-Table Management System' },
  { name: 'G14', rollNos: ['21','35','36','53'],   guideName: 'Mrs. R.V. Deshpande', projectTitle: 'Accessibility Mapping Application for People with Disability' },
  { name: 'G15', rollNos: ['56','57','64'],        guideName: 'Mrs. R.K. Ghate',     projectTitle: 'Mess Management System' },
  { name: 'G16', rollNos: ['5','23','39','40'],    guideName: 'Mrs. R.S. Thete',     projectTitle: 'Safe Voice (Anonymous Reporting APP)' },
  { name: 'G17', rollNos: ['66','42','45','28'],   guideName: 'Mrs. V.A. Wagh',      projectTitle: 'The End (Funeral Management and Crematorium Booking System)' },
  { name: 'G18', rollNos: ['1','7','33','48'],     guideName: 'Mrs. P.B. Datir',     projectTitle: 'True Source (Facts Checker)' },
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
    await Document.deleteMany({});
    await Certificate.deleteMany({});
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

    // ── 4. Create Students (using actual emails from CSV) ──
    const students = [];
    for (const sd of studentsData) {
      const student = await User.create({
        name: sd.name,
        email: sd.email,
        password: 'student123',
        role: 'student',
        enrollmentNumber: sd.enrollmentNumber,
        rollNumber: sd.rollNumber,
        department: 'CO',
        className: 'TY Diploma',
        division: 'A',
        academicYear: '2025-26',
      });
      students.push(student);
    }
    console.log(`✓ ${students.length} students created\n`);

    // ── 5. Create Groups (from Project Group CSV — exact mappings) ──
    const groups = [];
    for (const gc of groupsConfig) {
      // Map roll numbers to student indices
      const memberIds = gc.rollNos.map(roll => {
        const idx = rollToIndex[roll];
        if (idx === undefined) {
          console.warn(`  ⚠ Roll ${roll} not found in students list!`);
          return null;
        }
        return students[idx]._id;
      }).filter(Boolean);

      const mentor = mentors.find(m => m.name === gc.guideName);

      const group = await StudentGroup.create({
        name: gc.name,
        projectTitle: gc.projectTitle,
        projectGuide: gc.guideName,
        mentorId: mentor ? mentor._id : undefined,
        members: memberIds,
        academicYear: '2025-26',
        department: 'CO',
        overallProgress: 0,
      });

      // Update each student's groupId
      await User.updateMany(
        { _id: { $in: memberIds } },
        { groupId: group._id }
      );

      groups.push(group);
      console.log(`✓ ${gc.name}: "${gc.projectTitle}" (${gc.guideName}) — ${memberIds.length} members [rolls: ${gc.rollNos.join(', ')}]`);
    }
    console.log(`\n✓ ${groups.length} groups created\n`);

    // ── 6. Create Abstracts (one per group, mixed statuses) ──
    const abstractStatuses = ['pending', 'approved', 'rejected'];
    const abstractsCreated = [];
    for (let i = 0; i < groups.length; i++) {
      const status = abstractStatuses[i % 3];
      const gc = groupsConfig[i];
      const firstMemberIdx = rollToIndex[gc.rollNos[0]];
      const submitter = students[firstMemberIdx];
      const reviewer = mentors.find(m => m.name === gc.guideName);

      const abstractData = {
        title: gc.projectTitle,
        description: `This project "${gc.projectTitle}" aims to solve real-world problems using modern web technologies. The team plans to use React, Node.js, and MongoDB for implementation. The abstract covers the problem statement, proposed solution, timeline, and expected outcomes.`,
        groupId: groups[i]._id,
        submittedBy: submitter._id,
        status,
      };

      if (status === 'approved') {
        abstractData.feedback = 'Well-written abstract. Good problem definition and clear objectives. Approved for development.';
        abstractData.reviewedBy = reviewer?._id;
        abstractData.reviewedAt = new Date('2026-02-20');
      } else if (status === 'rejected') {
        abstractData.feedback = 'Abstract needs more details on the technical approach and feasibility. Please revise and resubmit.';
        abstractData.reviewedBy = reviewer?._id;
        abstractData.reviewedAt = new Date('2026-02-22');
      }

      const abstract = await Abstract.create(abstractData);
      abstractsCreated.push(abstract);
    }
    console.log(`✓ ${abstractsCreated.length} abstracts created (mixed statuses)\n`);

    // ── 7. Create Documents (various types across groups) ──
    const docTypes = ['synopsis', 'ppt_stage_one', 'ppt_final', 'weekly_diary', 'black_book', 'first_project_report', 'final_report', 'sponsorship_letter'];
    const docStatuses = ['pending', 'approved', 'needs_correction', 'verified'];
    let docsCreated = 0;

    for (let i = 0; i < groups.length; i++) {
      const gc = groupsConfig[i];
      const firstMemberIdx = rollToIndex[gc.rollNos[0]];
      const uploader = students[firstMemberIdx];
      const reviewer = mentors.find(m => m.name === gc.guideName);

      // Each group gets 2-3 documents
      const numDocs = 2 + (i % 2);
      for (let d = 0; d < numDocs; d++) {
        const docType = docTypes[(i + d) % docTypes.length];
        const status = docStatuses[(i + d) % docStatuses.length];
        const docData = {
          type: docType,
          fileName: `${gc.name}_${docType}_v${d + 1}.pdf`,
          fileUrl: `/uploads/${gc.name}_${docType}_v${d + 1}.pdf`,
          uploadedBy: uploader._id,
          groupId: groups[i]._id,
          stage: d < 2 ? 1 : 2,
          status,
        };

        if (status === 'approved' || status === 'verified') {
          docData.feedback = 'Document reviewed and accepted. Good work.';
          docData.reviewedBy = reviewer?._id;
          docData.reviewedAt = new Date('2026-02-25');
        } else if (status === 'needs_correction') {
          docData.feedback = 'Formatting issues found. Please fix the header layout and re-upload.';
          docData.reviewedBy = reviewer?._id;
          docData.reviewedAt = new Date('2026-02-24');
        }

        await Document.create(docData);
        docsCreated++;
      }
    }
    console.log(`✓ ${docsCreated} documents created\n`);

    // ── 8. Create Certificates (various types, some verified) ──
    const certTypes = ['itr_certificate', 'published_paper', 'project_competition', 'udemy_course'];
    let certsCreated = 0;

    for (let i = 0; i < 24; i++) {
      const studentIdx = i % students.length;
      const certType = certTypes[i % certTypes.length];
      const verified = i % 3 === 0;
      const reviewer = mentors[i % mentors.length];

      const certData = {
        type: certType,
        fileName: `${students[studentIdx].name.split(' ')[0]}_${certType}.pdf`,
        fileUrl: `/uploads/certs/${students[studentIdx].name.split(' ')[0]}_${certType}.pdf`,
        uploadedBy: students[studentIdx]._id,
        verified,
      };

      if (verified) {
        certData.verifiedBy = reviewer._id;
      }

      await Certificate.create(certData);
      certsCreated++;
    }
    console.log(`✓ ${certsCreated} certificates created\n`);

    // ── 9. Notices — skipped (admin creates notices via UI) ──
    console.log('✓ Notices: skipped (create via admin panel)\n');

    // ── 10. Create ITR Records (from ITR_students_list.doc — real placements) ──
    // Each company with its CO students by roll number and ITR faculty mentor
    const itrPlacements = [
      {
        company: 'Ideal Tech Infotech, Nashik',
        mentorName: 'Mr. Y.N. Jadhav',
        rollNos: ['4','5','6','7','8','9','13','14','18','19','24','25','27','28','29','30','31','32','33','35','36','38','39','40','44','45','46','47','50','51','62','65','68'],
      },
      {
        company: 'Softcrowd Technologies, Nashik',
        mentorName: 'Mrs. P.B. Datir',
        rollNos: ['1','2','10','22','23','37','55','59','60','61','64','66','67'],
      },
      {
        company: 'Calibers Infotech, Nashik',
        mentorName: 'Mrs. R.V. Deshpande',
        rollNos: ['12','15','16','20','21','26','34','41','42','43','48','49','53','54','56','58'],
      },
      {
        company: 'Codedrift Academy, Nashik',
        mentorName: 'Mrs. R.K. Ghate',
        rollNos: ['3','11','17','52','57','63'],
      },
    ];

    let itrCreated = 0;

    for (const placement of itrPlacements) {
      for (const roll of placement.rollNos) {
        const idx = rollToIndex[roll];
        if (idx === undefined) continue;

        const itrData = {
          studentId: students[idx]._id,
          companyName: placement.company,
          startDate: new Date('2025-05-05'),
          status: 'ongoing',
          coordinatorId: itrCoord._id,
          dailyDetails: [],
        };

        // Add a few sample daily entries
        const descriptions = [
          'Orientation and introduction to company environment',
          'Setup of development tools and project briefing',
          'Started working on assigned tasks and modules',
        ];
        for (let d = 0; d < 3; d++) {
          itrData.dailyDetails.push({
            date: new Date(`2025-05-${String(5 + d).padStart(2, '0')}`),
            description: descriptions[d],
            hours: 7,
          });
        }

        await ITR.create(itrData);
        itrCreated++;
      }
    }
    console.log(`✓ ${itrCreated} ITR records created\n`);

    // ── 11. Create AY 2024-25 Students & Groups (from 4378 - TYCO CPP.csv) ──
    console.log('─── AY 2024-25 Batch ───');

    // Additional mentors that only appear in 2024-25
    const mentor_gpb = await User.create({ name: 'Prof. G.P. Bharne', email: 'gp.bharne@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' });
    const mentor_ydj = await User.create({ name: 'Prof. Y.D. Jadhav', email: 'yd.jadhav@sandip.edu', password: 'mentor123', role: 'mentor', department: 'CO' });
    console.log('✓ 2 additional mentors created (Prof. G.P. Bharne, Prof. Y.D. Jadhav)');

    // All mentors including new ones — mapped by guide name in CSV
    const allMentorsMap = {};
    mentors.forEach(m => { allMentorsMap[m.name] = m; });
    allMentorsMap['Prof. G.P. Bharne'] = mentor_gpb;
    allMentorsMap['Prof. Y.D. Jadhav'] = mentor_ydj;
    // Map CSV guide names to our mentor names
    const guideLookup = {
      'Prof.V.B.Ohol': allMentorsMap['Mr. V.B. Ohol'],
      'Prof.R.V.Deshpande': allMentorsMap['Mrs. R.V. Deshpande'],
      'Prof.P.B.Datir': allMentorsMap['Mrs. P.B. Datir'],
      'Prof.Y.N.Jadhav': allMentorsMap['Mr. Y.N. Jadhav'],
      'Prof.R.S.Thete': allMentorsMap['Mrs. R.S. Thete'],
      'Prof.R.K.Ghate': allMentorsMap['Mrs. R.K. Ghate'],
      'Prof.G.P.Bharne': mentor_gpb,
      'Prof.Y.D.Jadhav': mentor_ydj,
    };

    // 2024-25 groups from CSV (19 groups) — with actual emails from TYCO_24_TO_25 CSV
    const groups2024 = [
      { grNo: '1', students: [
        { name: 'Kumbhar Mrunmai Sandip', enrollment: '2211670158', email: 'mrunmaikumbhar07@gmail.com' },
        { name: 'Aher Shubham Arun', enrollment: '2211670141', email: 'shubhamaher349@gmail.com' },
        { name: 'Suraywanshi Dipika Shantaram', enrollment: '2211670133', email: 'suryawanshidipika5@gmail.com' },
        { name: 'Gole Apurva Anand', enrollment: '2211670147', email: 'apurvagole45@gmail.com' },
      ], project: 'Aerosense', guide: 'Prof.V.B.Ohol' },
      { grNo: '2', students: [
        { name: 'Chaudhari Vaishnavi Nitin', enrollment: '2211670160', email: 'Vaishnavichaudhari666@gmail.com' },
        { name: 'Shejwal Sai Devidas', enrollment: '2211670139', email: 'saishshejwal008@gmail.com' },
        { name: 'Kadam Maina Haribhau', enrollment: '2211670143', email: 'kadammaina707@gmail.com' },
        { name: 'Nathe Vicky Anil', enrollment: '2211670157', email: 'vickynathe45@gmail.com' },
      ], project: 'Crime Management System', guide: 'Prof.R.V.Deshpande' },
      { grNo: '3', students: [
        { name: 'Patil Mansi Pravin', enrollment: '2211670104', email: 'pmansi2006@gmail.com' },
        { name: 'Bharti Anjali Ashok', enrollment: '2211670108', email: 'anjalibharti4131@gmail.com' },
        { name: 'Mule Bhakti Vitthal', enrollment: '2211670128', email: 'bhaktimule4962@gmail.com' },
        { name: 'Bajaj Gayatri Anil', enrollment: '23611780239', email: 'gayatribajaj02@gmail.com' },
      ], project: 'Website for Self Diagnosis and Drug Recommendation', guide: 'Prof.R.V.Deshpande' },
      { grNo: '4', students: [
        { name: 'Darade Ruchita Nitin', enrollment: '2211670112', email: 'daraderuchita742@gmail.com' },
        { name: 'Borse Bhagyashri Sunil', enrollment: '2211670103', email: 'bhagyashreeborse30@gmail.com' },
        { name: 'Zalte Vedika Haribhau', enrollment: '2211670152', email: 'vedikazalte2309@gmail.com' },
        { name: 'Pagar Sakshi Shivdas', enrollment: '23611780251', email: 'sakshipagar806@gmail.com' },
      ], project: 'Smart Tourist', guide: 'Prof.P.B.Datir' },
      { grNo: '5', students: [
        { name: 'Gamne Chaitanya Sanjay', enrollment: '2211670138', email: 'chaitanyagamane@gmail.com' },
        { name: 'Jagtap Shradha Suresh', enrollment: '2211670111', email: 'shraddhajagtap9826@gmail.com' },
        { name: 'Mahale Paras Nitin', enrollment: '2211670145', email: 'prsmahale@gmail.com' },
        { name: 'Jadhav Omkar Machindra', enrollment: '2211670159', email: 'omkarjadhavm5@gmail.com' },
      ], project: 'Farmer Equipment Rental Web Application', guide: 'Prof.V.B.Ohol' },
      { grNo: '6', students: [
        { name: 'Suryawanshi Vishwajeet Nitin', enrollment: '2211670154', email: 'Visuryswanshi@gmail.com' },
        { name: 'Rathore Vaibhav', enrollment: '2211670150', email: 'vaibhavrathore285@gmail.com' },
        { name: 'Katore Prasad Dattu', enrollment: '2211670335', email: 'prasadkatore2004@gmail.com' },
        { name: 'Sanap Kunal Vilas', enrollment: '2211670122', email: 'kunalsanap8484@gmail.com' },
      ], project: 'Car Buying Guide', guide: 'Prof.Y.N.Jadhav' },
      { grNo: '7', students: [
        { name: 'Vende Prajwal Nitin', enrollment: '2211670102', email: 'prajwalvende06@gmail.com' },
        { name: 'Kakulte Om Jagannath', enrollment: '2211670140', email: 'omkakulte38@gmail.com' },
        { name: 'Badgujar Gaurav Vijay', enrollment: '2211670100', email: 'badgujargaurav276@gmail.com' },
        { name: 'Patil Manas Yuvraj', enrollment: '2211670144', email: 'manasp287@gmail.com' },
      ], project: 'Quick Offline Pay', guide: 'Prof.Y.N.Jadhav' },
      { grNo: '8', students: [
        { name: 'Borse Aditya Sharad', enrollment: '2211670099', email: 'adiborse46@gmail.com' },
        { name: 'Tajne Rugved Vijay', enrollment: '2211670131', email: 'rugvedtajane04@gmail.com' },
        { name: 'Patil Vaishnavi Hemraj', enrollment: '2211670153', email: 'Vaishnavipatil1076@gmail.com' },
      ], project: 'Career Path Finder', guide: 'Prof.V.B.Ohol' },
      { grNo: '9', students: [
        { name: 'Pagar Ashwini Avinash', enrollment: '2211670129', email: 'avinashpagare5555@gmail.com' },
        { name: 'Jadhav Shubham Abasaheb', enrollment: '23611780243', email: 'jadhavshubham2002sj@gmail.com' },
        { name: 'Thakre Manjusha Ashok', enrollment: '23611780240', email: 'manjuthakare2004@gmail.com' },
        { name: 'Bhondawe Mayuresh Keshav', enrollment: '23611780245', email: 'mayurbhondwe636@gmail.com' },
      ], project: 'Real Time Visitor Tracker of Goshala', guide: 'Prof.R.S.Thete' },
      { grNo: '10', students: [
        { name: 'Dawange Sahil Suresh', enrollment: '2211670105', email: 'sahildawange37@gmail.com' },
        { name: 'Jamdar Sarvesh Jitendra', enrollment: '2211670095', email: 'sarvesh.sj01@gmail.com' },
        { name: 'Ahire Prajwal Manik', enrollment: '2211670106', email: 'prajwalahire2@gmail.com' },
        { name: 'Koli Snehal Prabhakar', enrollment: '2211670130', email: 'kolisonu565@gmail.com' },
      ], project: 'Mental Health Consulting Website', guide: 'Prof.R.V.Deshpande' },
      { grNo: '11', students: [
        { name: 'Rathore Krishna', enrollment: '2211670146', email: 'krishnarathore0802@gmail.com' },
        { name: 'Gawali Gananjay Kashinath', enrollment: '2211670097', email: 'gananjaygawali@gmail.com' },
        { name: 'Chaudhari Pushkar Govind', enrollment: '2211670149', email: 'chaudharipushkar412@gmail.com' },
        { name: 'Shinde Siddharth Santosh', enrollment: '2211670118', email: 'siddharthsshinde9822@gmail.com' },
      ], project: 'Health Care Adviser Application', guide: 'Prof.Y.N.Jadhav' },
      { grNo: '12', students: [
        { name: 'Gangurde Kasturi Devaji', enrollment: '2211670107', email: 'gangurdekasturi@gmail.com' },
        { name: 'Bhamre Shruti Prashant', enrollment: '2211670137', email: 'bhamareshruti012@gmail.com' },
        { name: 'Zade Tanishka Nandu', enrollment: '2211670151', email: 'tanishkazade123@gmail.com' },
      ], project: 'Agri Shop For Farmer', guide: 'Prof.G.P.Bharne' },
      { grNo: '13', students: [
        { name: 'Patil Kajal Laxman', enrollment: '2211670110', email: 'kajallpatil2007@gmail.com' },
        { name: 'Bhandure Vaishnavi Sampat', enrollment: '2211670142', email: 'vaishnavibhandure01@gmail.com' },
        { name: 'Halor Kalyani Sanjay', enrollment: '2111670136', email: null },
        { name: 'Gauri Pawar', enrollment: '23611780241', email: null },
      ], project: 'Smart Street Light System', guide: 'Prof.G.P.Bharne' },
      { grNo: '14', students: [
        { name: 'Patil Bhagyashri Nitin', enrollment: '2211670132', email: 'patilbn2006@gmail.com' },
        { name: 'Siddhant Gangurde Kiran', enrollment: '2211670116', email: 'kirangangurde955@gmail.com' },
      ], project: 'E-plastic Waste Management Application', guide: 'Prof.R.V.Deshpande' },
      { grNo: '15', students: [
        { name: 'Borse Sakshi Narayan', enrollment: '2211670114', email: 'Sakshiborse1108@gmail.com' },
        { name: 'Chandramore Sanchita Ragnath', enrollment: '2211670117', email: 'rcchandramore2@gamil.com' },
        { name: 'Rajput Aditi Ramchandra', enrollment: '2211670094', email: 'rajputaditti@gmail.com' },
        { name: 'Gangurde Pranali Ashok', enrollment: '2211670113', email: 'Gangurdesavidhan@gmail.com' },
      ], project: 'Rent My Stuff', guide: 'Prof.R.K.Ghate' },
      { grNo: '16', students: [
        { name: 'Khan Rehan Aslam', enrollment: '23611780250', email: 'rehan.com56789@gmail.com' },
        { name: 'Chaudhari Aditya Aba', enrollment: '23611780247', email: 'chaudhariaditya98@gmail.com' },
        { name: 'Mahale Vishwajit Ajabsingh', enrollment: '2211670135', email: 'Vishwajitmahale9@gmail.com' },
        { name: 'Ilag Sanket Ashok', enrollment: '23611780244', email: 'sanketilag60@gmail.com' },
      ], project: 'Puzzle Alarm', guide: 'Prof.P.B.Datir' },
      { grNo: '17', students: [
        { name: 'Bochare Sanchit Sharad', enrollment: '2211670156', email: 'Bocharesanchit2@gmail.com' },
        { name: 'Davane Siddhant Mangesh', enrollment: '2211670101', email: 'Siddhudavane123@gmail.com' },
        { name: 'Kale Swanand Dnyaeshwar', enrollment: '2211670155', email: 'swanandkale83@gmail.com' },
        { name: 'Vaydeshkar Aniket Vishal', enrollment: '2211670125', email: 'krishnavaydeshkar@gmail.com' },
      ], project: 'Labor Management System', guide: 'Prof.Y.D.Jadhav' },
      { grNo: '18', students: [
        { name: 'Joshi Nisha Jagannath', enrollment: '23611780248', email: 'jagannathjoshi36@gmail.com' },
        { name: 'Deore Tanvi Manoj', enrollment: '23611780249', email: 'tanvideore91@gmail.com' },
        { name: 'Bagul Reva Namdev', enrollment: '23611780238', email: 'revabagul2005@gmail.com' },
        { name: 'Sonawane Krishna Bharat', enrollment: '23611780246', email: 'krushnasonawane3012@gmail.com' },
      ], project: 'Candidate Assessment Tool', guide: 'Prof.G.P.Bharne' },
      { grNo: '19', students: [
        { name: 'Wani Anushka Vilas', enrollment: '2211670109', email: null },
        { name: 'Bhirud Yamini Mohan', enrollment: '2211670119', email: 'yaminibhirud07@gmail.com' },
        { name: 'Kundalke Shubham Kailas', enrollment: '2211670126', email: 'shubhamkundalke@gmail.com' },
      ], project: 'Cryptography', guide: 'Prof.V.B.Ohol' },
    ];

    let students2024Created = 0;
    let groups2024Created = 0;

    for (const gData of groups2024) {
      const memberIds = [];
      let rollCounter = students2024Created + 1;

      for (const sd of gData.students) {
        // Use actual email from CSV, fall back to auto-generated if not available
        const actualEmail = sd.email
          ? sd.email.trim()
          : `${sd.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}.2024@sandip.edu`;
        const student = await User.create({
          name: sd.name,
          email: actualEmail,
          password: 'student123',
          role: 'student',
          enrollmentNumber: sd.enrollment,
          rollNumber: String(rollCounter),
          department: 'CO',
          className: 'TY Diploma',
          division: 'A',
          academicYear: '2024-25',
        });
        memberIds.push(student._id);
        rollCounter++;
        students2024Created++;
      }

      const mentor = guideLookup[gData.guide];
      const group = await StudentGroup.create({
        name: `G${gData.grNo}`,
        projectTitle: gData.project,
        projectGuide: mentor ? mentor.name : gData.guide,
        mentorId: mentor ? mentor._id : undefined,
        members: memberIds,
        academicYear: '2024-25',
        department: 'CO',
        overallProgress: 0,
      });

      await User.updateMany({ _id: { $in: memberIds } }, { groupId: group._id });
      groups2024Created++;
      console.log(`✓ G${gData.grNo}: "${gData.project}" — ${memberIds.length} members`);
    }
    console.log(`\n✓ ${students2024Created} students (AY 2024-25) created`);
    console.log(`✓ ${groups2024Created} groups (AY 2024-25) created\n`);

    // ── Summary ──
    console.log('═══════════════════════════════════════════');
    console.log('  SEED COMPLETE — Summary');
    console.log('═══════════════════════════════════════════');
    console.log(`  Admin:           1  (admin@sandip.edu / admin123)`);
    console.log(`  ITR Coordinator: 1  (itr@sandip.edu / itr123)`);
    console.log(`  Mentors:         ${mentors.length}  (password: mentor123)`);
    console.log(`  Students:        ${students.length} (password: student123)`);
    console.log(`  Groups:          ${groups.length}`);
    console.log(`  Abstracts:       ${abstractsCreated.length}`);
    console.log(`  Documents:       ${docsCreated}`);
    console.log(`  Certificates:    ${certsCreated}`);
    console.log(`  Notices:         0  (create via admin panel)`);
    console.log(`  ITR Records:     ${itrCreated}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
