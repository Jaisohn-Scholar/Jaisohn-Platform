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
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
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

  // Seed opportunities
  const existing = await sql`SELECT COUNT(*) as count FROM opportunities`;
  if (Number(existing.rows[0].count) === 0) {
    await sql`INSERT INTO opportunities (id, type, name, description, award, slots) VALUES
      ('opp1', 'scholarship', 'Philip Jaisohn Leadership Scholarship', 'Awarded to outstanding students who demonstrate leadership potential and commitment to the Asian American community. Open to high school seniors and college students.', '$2,500', 3),
      ('opp2', 'scholarship', 'Health & Human Services Scholarship', 'For students pursuing careers in healthcare, social work, or public health with a desire to serve underrepresented communities.', '$1,500', 2),
      ('opp3', 'internship', 'Community Outreach Internship', 'Work with our outreach team to connect with the Korean American community in the Philadelphia area. Gain hands-on nonprofit experience.', 'Stipend: $500/month', 2),
      ('opp4', 'internship', 'Health Services Internship', 'Support our health services programs, assist with patient coordination, and help run health screenings and events.', 'Stipend: $600/month', 1)
    ON CONFLICT (id) DO NOTHING`;
  }

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
