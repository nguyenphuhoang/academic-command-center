-- 001_initial_schema.sql
-- Created: 2026-04-29
-- This file contains the full database schema for the Academic Command Center.

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    mssv TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    device_id TEXT, -- Khớp với thực tế DB
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ma_lop TEXT UNIQUE NOT NULL,
    ten_mon TEXT,
    semester TEXT,
    subject_id UUID, -- Thêm cột thiếu
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT,
    semester TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction Table: Students in Classes
CREATE TABLE IF NOT EXISTS class_students (
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    mssv TEXT REFERENCES students(mssv) ON DELETE CASCADE,
    PRIMARY KEY (class_id, mssv) -- Sử dụng Composite Primary Key làm Unique Constraint
);

-- Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_lat DOUBLE PRECISION,
    teacher_lng DOUBLE PRECISION,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    mssv TEXT REFERENCES students(mssv) ON DELETE CASCADE,
    student_lat DOUBLE PRECISION,
    student_lng DOUBLE PRECISION,
    distance DOUBLE PRECISION,
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT, -- Thêm cột thiếu
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'Pending',
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
