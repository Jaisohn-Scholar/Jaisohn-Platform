import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "jaisohn.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      password TEXT,
      role TEXT DEFAULT 'applicant',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      UNIQUE(provider, provider_account_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires TEXT NOT NULL,
      PRIMARY KEY(identifier, token)
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      award TEXT,
      slots INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
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
      submitted_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(opportunity_id) REFERENCES opportunities(id)
    );
  `);

  // Seed opportunities
  const opps = db.prepare("SELECT COUNT(*) as count FROM opportunities").get() as { count: number };
  if (opps.count === 0) {
    const insert = db.prepare(`INSERT INTO opportunities (id, type, name, description, award, slots) VALUES (?, ?, ?, ?, ?, ?)`);
    insert.run("opp1", "scholarship", "Philip Jaisohn Leadership Scholarship", "Awarded to outstanding students who demonstrate leadership potential and commitment to the Asian American community. Open to high school seniors and college students.", "$2,500", 3);
    insert.run("opp2", "scholarship", "Health & Human Services Scholarship", "For students pursuing careers in healthcare, social work, or public health with a desire to serve underrepresented communities.", "$1,500", 2);
    insert.run("opp3", "internship", "Community Outreach Internship", "Work with our outreach team to connect with the Korean American community in the Philadelphia area. Gain hands-on nonprofit experience.", "Stipend: $500/month", 2);
    insert.run("opp4", "internship", "Health Services Internship", "Support our health services programs, assist with patient coordination, and help run health screenings and events.", "Stipend: $600/month", 1);
  }

  // Seed reviewer account
  const reviewer = db.prepare("SELECT id FROM users WHERE email = ?").get("koseli.thakali@jaisohn.org");
  if (!reviewer) {
    const hash = bcrypt.hashSync("JaisohnCenter", 10);
    const id = "reviewer-" + Date.now();
    db.prepare("INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)").run(
      id, "koseli.thakali@jaisohn.org", "Koseli Thakali", hash, "reviewer"
    );
  }
}

export default getDb;
