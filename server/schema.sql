-- PaperVault Database Schema for PostgreSQL / Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Branches Table (UPTTI Kanpur)
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL
);

-- 3. Semesters Table (1 - 8)
CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    number INT UNIQUE NOT NULL
);

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
    semester_id INT REFERENCES semesters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL
);

-- 5. Papers Table
CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id INT REFERENCES branches(id) ON DELETE SET NULL,
    semester_id INT REFERENCES semesters(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'unpublished')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 6. Suggestions Table
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_filters ON papers(branch_id, semester_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_papers_subject_code ON papers(subject_code);
CREATE INDEX IF NOT EXISTS idx_subjects_branch_sem ON subjects(branch_id, semester_id);
