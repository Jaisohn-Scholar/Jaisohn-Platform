import { sql } from "@vercel/postgres";

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      password TEXT,
      role TEXT DEFAULT 'applicant',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      UNIQUE(provider, provider_account_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      award TEXT,
      slots INTEGER DEFAULT 1,
      requirements TEXT,
      deadline TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Add columns if they don't exist (for existing tables)
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS requirements TEXT`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS deadline TEXT`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS required_fields TEXT DEFAULT '["name","email","school","year","birthday"]'`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS required_docs TEXT DEFAULT '["resume","transcript"]'`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS essay1_prompt TEXT DEFAULT 'Tell us about yourself and why you are interested in this opportunity.'`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS essay2_prompt TEXT DEFAULT 'Describe a time you demonstrated leadership or made an impact in your community.'`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS essay3_prompt TEXT DEFAULT 'What are your future goals and how will this opportunity help you achieve them?'`;

  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      opportunity_id TEXT NOT NULL REFERENCES opportunities(id),
      status TEXT DEFAULT 'in_progress',
      essay1 TEXT,
      essay2 TEXT,
      essay3 TEXT,
      resume_path TEXT,
      transcript_path TEXT,
      cover_letter_path TEXT,
      rec_letter_path TEXT,
      financial_need_path TEXT,
      supporting_docs_path TEXT,
      applicant_school TEXT,
      applicant_year TEXT,
      applicant_birthday TEXT,
      score INTEGER,
      review_notes TEXT,
      essay1_score INTEGER,
      essay2_score INTEGER,
      essay3_score INTEGER,
      resume_score INTEGER,
      transcript_score INTEGER,
      submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter_path TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS rec_letter_path TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS financial_need_path TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS supporting_docs_path TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_school TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_year TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_birthday TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS alumni (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      opportunity_name TEXT NOT NULL,
      university TEXT,
      major TEXT,
      year TEXT,
      photo_path TEXT,
      project TEXT,
      quote TEXT,
      display_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT false,
      user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS user_id TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS application_comments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewer_name TEXT NOT NULL,
      reviewer_email TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed opportunities
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-ibc', 'internship', 'Independence Blue Cross Nursing Internship', 'Awarded to 2 undergraduate nursing students from Jefferson College and the Community College of Philadelphia.', '$20/hr', 2, 'Undergraduate Nursing Student', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-wl', 'internship', 'Wooyoung Lee Internship', 'Awarded to 3 students a part of the New American Initiative PA (NAI-PA).', '$3,000', 3, 'Undergraduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-ts', 'internship', 'Tong S. Suhr Internship', 'A 10 week internship open for all students with interests in journalism, communications, and leadership.', '$5,000', 1, 'Undergraduate & Graduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-hl', 'internship', 'Helen Lee Internship', 'An 8 week internship open to Korean-American graduate students.', '$4,000', 1, 'Graduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-kfh', 'internship', 'Kweon Family Hope Internship', 'A 6 week internship awarded to 2 Korean-American or Korean International students that demonstrate need.', '$3,000', 2, 'Undergraduate & Graduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-hrc', 'internship', 'Hack Ryang Chung Internship', 'A 6 week internship open to all students with interests in healthcare and/or mental health.', '$3,000', 1, 'Undergraduate & Graduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-hsko', 'internship', 'Henry S-K Oh Internship', 'A 5 week internship open to all students with interests in community service.', '$2,500', 1, 'Undergraduate & Graduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-bhh', 'internship', 'Bong Hak Hyun Internship', 'A 4 week internship open to all students with interests in healthcare and/or mental health.', '$2,000', 1, 'Undergraduate', 'Rolling')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-jc', 'scholarship', 'Jaisohn Challenge Scholarship', 'Awarded to 2 students overcoming challenges.', '$3,000', 2, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-dy', 'scholarship', 'Daniel Yun Scholarship', 'Awarded to a Korean-American student with interests in healthcare.', '$1,500', 1, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-cl', 'scholarship', 'Chongsik Lee Scholarship', 'Awarded to a Korean-American student with interests in political science and international relations.', '$1,500', 1, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-tp', 'scholarship', 'Tang Pharmacy Scholarship', 'Awarded to a Korean-American student in good academic standing and with interests in volunteering and community service.', '$1,500', 1, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-jdf', 'scholarship', 'Jae and Dae Foundation Scholarship', 'Awarded to an African-American student in good academic standing with interests in community service and volunteering.', '$1,500', 1, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-brs', 'scholarship', 'Best Ride Services Scholarship', 'Awarded to a student that demonstrates leadership and volunteers for the community.', '$1,500', 1, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline) VALUES
    ('opp-hf', 'scholarship', 'Honam Friendship Scholarship', 'Awarded to a Korean-American student in good academic standing that demonstrates leadership.', '$1,500', 1, 'Undergraduate & Graduate', 'June 30, 2026')
    ON CONFLICT (id) DO NOTHING`;

  // Seed reviewer
  const reviewer = await sql`SELECT id FROM users WHERE email = 'koseli.thakali@jaisohn.org'`;
  if (reviewer.rows.length === 0) {
    const bcrypt = await import("bcryptjs");
    const hash = bcrypt.hashSync("JaisohnCenter", 10);
    await sql`INSERT INTO users (id, email, name, password, role) VALUES ('reviewer-seed', 'koseli.thakali@jaisohn.org', 'Koseli Thakali', ${hash}, 'reviewer') ON CONFLICT DO NOTHING`;
  }
}

let initialized = false;
export async function ensureDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

export { sql };
