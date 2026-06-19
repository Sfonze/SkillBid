-- SkillBid database schema (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SME','STUDENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('OPEN','IN_PROGRESS','COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE milestone_status AS ENUM ('PENDING','SUBMITTED','APPROVED','CHANGES_REQUESTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('PENDING','ACCEPTED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM ('PENDING_STUDENT_INFO','PENDING_SME_SIGNATURE','PENDING_STUDENT_SIGNATURE','SIGNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sme_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  foundation_date DATE,
  vat_number TEXT,
  core_business TEXT,
  tasks_completed_before INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS logo_data TEXT;
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Maastricht, Netherlands';
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE sme_profiles ADD COLUMN IF NOT EXISTS company_size TEXT;

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  university TEXT,
  university_email TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  completed_tasks_count INT NOT NULL DEFAULT 0,
  rating NUMERIC(3,2),
  verified BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Maastricht, Netherlands';
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS avatar_data TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS response_time TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS hours_per_week INT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS skill_levels JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS degree TEXT;

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sme_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  language TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  remuneration NUMERIC(10,2) NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status task_status NOT NULL DEFAULT 'OPEN',
  allocated_student_id UUID REFERENCES users(id),
  contract_id UUID
);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sme ON tasks(sme_id);

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status milestone_status NOT NULL DEFAULT 'PENDING',
  note TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_milestones_task ON milestones(task_id);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'PENDING',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cover_note TEXT,
  UNIQUE(task_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_task ON applications(task_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  sme_id UUID NOT NULL REFERENCES users(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status contract_status NOT NULL DEFAULT 'PENDING_STUDENT_INFO',
  student_legal_name TEXT,
  student_address TEXT,
  student_iban TEXT,
  student_tax_id TEXT,
  gross_remuneration NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,3) NOT NULL DEFAULT 0.15,
  net_to_student NUMERIC(10,2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date DATE,
  signed_at_sme TIMESTAMPTZ,
  signed_at_student TIMESTAMPTZ
);

DO $$ BEGIN
  ALTER TABLE tasks ADD CONSTRAINT fk_tasks_contract FOREIGN KEY (contract_id) REFERENCES contracts(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id),
  from_role user_role NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_task ON messages(task_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  link_view TEXT,
  link_task_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_role user_role NOT NULL,
  to_user_id UUID NOT NULL REFERENCES users(id),
  score INT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, from_role)
);
