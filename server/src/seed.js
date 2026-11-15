const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { pool } = require('./db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log('--- Starting PaperVault Database Seeding ---');

  // Check if .env has required variables, otherwise generate admin credentials
  const envPath = path.join(__dirname, '../.env');
  const exampleEnvPath = path.join(__dirname, '../.env.example');

  let adminUsername = process.env.ADMIN_USERNAME || 'admin';
  let adminPassword = process.env.ADMIN_PASSWORD || 'VaultAdmin@Kanpur2026!';
  let jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    jwtSecret = crypto.randomBytes(32).toString('hex');
  }

  // Ensure .env has these values
  if (!fs.existsSync(envPath)) {
    const envContent = `# PaperVault Server Environment
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=${process.env.DATABASE_URL || ''}

# Supabase Storage & API
SUPABASE_URL=${process.env.SUPABASE_URL || ''}
SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY || ''}

# JWT Authentication
JWT_SECRET=${jwtSecret}

# Default Admin Credentials
ADMIN_USERNAME=${adminUsername}
ADMIN_PASSWORD=${adminPassword}
`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('Created server/.env file');
  }

  // Create .env.example
  const exampleContent = `# PaperVault Server Environment Example
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Storage & API
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# JWT Authentication
JWT_SECRET=your_jwt_secret_min_32_chars

# Default Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
`;
  fs.writeFileSync(exampleEnvPath, exampleContent, 'utf8');

  // Execute schema first
  const schemaPath = path.join(__dirname, '../schema.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('Applying database schema from schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Schema successfully applied!');
  }

  // 1. Seed Branches
  const branches = [
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Textile Technology', code: 'TT' },
    { name: 'Textile Chemistry', code: 'TC' },
    { name: 'Man-Made Fibre Technology', code: 'MMFT' },
    { name: 'Textile Engineering', code: 'TE' },
  ];

  console.log('Seeding branches...');
  for (const b of branches) {
    await pool.query(
      `INSERT INTO branches (name, code)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code`,
      [b.name, b.code]
    );
  }

  // 2. Seed Semesters (1 to 8)
  console.log('Seeding semesters (1-8)...');
  for (let s = 1; s <= 8; s++) {
    await pool.query(
      `INSERT INTO semesters (number)
       VALUES ($1)
       ON CONFLICT (number) DO NOTHING`,
      [s]
    );
  }

  // Fetch branch map and semester map
  const branchesRows = (await pool.query('SELECT id, code FROM branches')).rows;
  const branchMap = {};
  branchesRows.forEach((r) => {
    branchMap[r.code] = r.id;
  });

  const semestersRows = (await pool.query('SELECT id, number FROM semesters')).rows;
  const semMap = {};
  semestersRows.forEach((r) => {
    semMap[r.number] = r.id;
  });

  // 3. Seed Realistic Subjects across branches and semesters
  const sampleSubjects = [
    // CSE
    { branch: 'CSE', sem: 1, name: 'Engineering Mathematics-I', code: 'BAS-103' },
    { branch: 'CSE', sem: 1, name: 'Engineering Physics', code: 'BAS-101' },
    { branch: 'CSE', sem: 2, name: 'Programming for Problem Solving', code: 'BCS-201' },
    { branch: 'CSE', sem: 2, name: 'Engineering Chemistry', code: 'BAS-202' },
    { branch: 'CSE', sem: 3, name: 'Data Structures', code: 'BCS-301' },
    { branch: 'CSE', sem: 3, name: 'Discrete Structures & Graph Theory', code: 'BCS-302' },
    { branch: 'CSE', sem: 4, name: 'Operating Systems', code: 'BCS-401' },
    { branch: 'CSE', sem: 4, name: 'Theory of Automata & Formal Languages', code: 'BCS-402' },
    { branch: 'CSE', sem: 5, name: 'Database Management Systems', code: 'BCS-501' },
    { branch: 'CSE', sem: 5, name: 'Design and Analysis of Algorithms', code: 'BCS-502' },
    { branch: 'CSE', sem: 6, name: 'Computer Networks', code: 'BCS-601' },
    { branch: 'CSE', sem: 6, name: 'Software Engineering', code: 'BCS-602' },
    { branch: 'CSE', sem: 7, name: 'Artificial Intelligence', code: 'BCS-701' },
    { branch: 'CSE', sem: 8, name: 'Cloud Computing & Distributed Systems', code: 'BCS-801' },

    // TT (Textile Technology)
    { branch: 'TT', sem: 3, name: 'Yarn Manufacture-I', code: 'TT-301' },
    { branch: 'TT', sem: 3, name: 'Textile Fibre Science', code: 'TT-302' },
    { branch: 'TT', sem: 4, name: 'Fabric Manufacture-I', code: 'TT-401' },
    { branch: 'TT', sem: 4, name: 'Yarn Manufacture-II', code: 'TT-402' },
    { branch: 'TT', sem: 5, name: 'Fabric Manufacture-II', code: 'TT-501' },
    { branch: 'TT', sem: 5, name: 'Textile Testing & Quality Control', code: 'TT-502' },
    { branch: 'TT', sem: 6, name: 'Advanced Spinning Technology', code: 'TT-601' },
    { branch: 'TT', sem: 7, name: 'Technical Textiles', code: 'TT-701' },

    // TC (Textile Chemistry)
    { branch: 'TC', sem: 3, name: 'Chemical Processing of Textiles-I', code: 'TC-301' },
    { branch: 'TC', sem: 4, name: 'Technology of Dyeing-I', code: 'TC-401' },
    { branch: 'TC', sem: 5, name: 'Technology of Printing', code: 'TC-501' },
    { branch: 'TC', sem: 6, name: 'Advanced Colouration & Finishing', code: 'TC-601' },

    // MMFT (Man-Made Fibre Technology)
    { branch: 'MMFT', sem: 3, name: 'Polymer Science & Technology', code: 'MMFT-301' },
    { branch: 'MMFT', sem: 4, name: 'Synthetic Fibre Production-I', code: 'MMFT-401' },
    { branch: 'MMFT', sem: 5, name: 'Structure & Property of Synthetic Fibres', code: 'MMFT-501' },
    { branch: 'MMFT', sem: 6, name: 'High Performance Fibres', code: 'MMFT-601' },

    // TE (Textile Engineering)
    { branch: 'TE', sem: 3, name: 'Mechanics of Textile Machines', code: 'TE-301' },
    { branch: 'TE', sem: 4, name: 'Theory of Textile Mechanisms', code: 'TE-401' },
    { branch: 'TE', sem: 5, name: 'Control Systems in Textile Machinery', code: 'TE-501' },
    { branch: 'TE', sem: 6, name: 'Textile Mill Engineering', code: 'TE-601' },
  ];

  console.log('Seeding subjects...');
  for (const sub of sampleSubjects) {
    const bId = branchMap[sub.branch];
    const sId = semMap[sub.sem];
    if (bId && sId) {
      await pool.query(
        `INSERT INTO subjects (branch_id, semester_id, name, code)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [bId, sId, sub.name, sub.code]
      );
    }
  }

  // 4. Seed Admin Account
  console.log(`Seeding Admin Account (${adminUsername})...`);
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await pool.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [adminUsername, passwordHash]
  );
  console.log(`Admin account [${adminUsername}] seeded successfully.`);

  // 5. Seed Sample Approved Papers & Sample Suggestions
  console.log('Seeding initial verified sample papers...');
  const samplePapers = [
    {
      branch_code: 'CSE',
      sem: 3,
      subject_name: 'Data Structures',
      subject_code: 'BCS-301',
      academic_year: '2023-24',
      exam_type: 'End Semester',
      file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      file_path: 'sample/data-structures-2023.pdf',
      status: 'approved',
    },
    {
      branch_code: 'CSE',
      sem: 4,
      subject_name: 'Operating Systems',
      subject_code: 'BCS-401',
      academic_year: '2022-23',
      exam_type: 'End Semester',
      file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      file_path: 'sample/operating-systems-2022.pdf',
      status: 'approved',
    },
    {
      branch_code: 'CSE',
      sem: 5,
      subject_name: 'Database Management Systems',
      subject_code: 'BCS-501',
      academic_year: '2023-24',
      exam_type: 'Mid Semester',
      file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      file_path: 'sample/dbms-2023.pdf',
      status: 'approved',
    },
    {
      branch_code: 'TT',
      sem: 3,
      subject_name: 'Yarn Manufacture-I',
      subject_code: 'TT-301',
      academic_year: '2023-24',
      exam_type: 'End Semester',
      file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      file_path: 'sample/yarn-manufacture-2023.pdf',
      status: 'approved',
    },
    {
      branch_code: 'TT',
      sem: 5,
      subject_name: 'Textile Testing & Quality Control',
      subject_code: 'TT-502',
      academic_year: '2022-23',
      exam_type: 'End Semester',
      file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      file_path: 'sample/textile-testing-2022.pdf',
      status: 'approved',
    },
    {
      branch_code: 'TC',
      sem: 3,
      subject_name: 'Chemical Processing of Textiles-I',
      subject_code: 'TC-301',
      academic_year: '2023-24',
      exam_type: 'End Semester',
      file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      file_path: 'sample/chemical-processing-2023.pdf',
      status: 'approved',
    },
  ];

  for (const p of samplePapers) {
    const bId = branchMap[p.branch_code];
    const sId = semMap[p.sem];
    if (bId && sId) {
      await pool.query(
        `INSERT INTO papers 
           (branch_id, semester_id, subject_name, subject_code, academic_year, exam_type, file_url, file_path, status, submitted_at, reviewed_at)
         VALUES 
           ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [bId, sId, p.subject_name, p.subject_code, p.academic_year, p.exam_type, p.file_url, p.file_path, p.status]
      );
    }
  }

  // 6. Seed Sample Suggestions
  console.log('Seeding initial sample suggestions...');
  const sampleSuggestions = [
    { category: 'Missing Paper Request', message: 'Could you please upload the 2021-22 End Sem paper for Compiler Design (CSE Sem 6)?', status: 'new' },
    { category: 'General Feedback', message: 'The interface is very fast and intuitive! Great initiative for UPTTI students.', status: 'resolved' },
  ];

  for (const s of sampleSuggestions) {
    await pool.query(
      `INSERT INTO suggestions (category, message, status, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT DO NOTHING`,
      [s.category, s.message, s.status]
    );
  }

  console.log('=== Database Seeding Completed Successfully! ===');
  console.log(`Admin Username: ${adminUsername}`);
  console.log(`Admin Password: ${adminPassword}`);
  console.log('------------------------------------------------');
}

if (require.main === module) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seed;
