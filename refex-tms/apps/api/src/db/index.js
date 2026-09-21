import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let db

function resolveSqlitePath() {
  const url = config.databaseUrl
  if (url.startsWith('file:')) {
    const rel = url.replace(/^file:/, '')
    return path.isAbsolute(rel)
      ? rel
      : path.resolve(__dirname, '../..', rel)
  }
  return path.resolve(__dirname, '../../data/tms.sqlite')
}

export function getDb() {
  if (db) return db
  const file = resolveSqlitePath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  db = new DatabaseSync(file)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  migrate(db)
  return db
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      employee_id TEXT,
      department TEXT,
      designation TEXT,
      role TEXT NOT NULL,
      manager_id TEXT,
      mobile TEXT,
      cost_centre TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS travel_requests (
      id TEXT PRIMARY KEY,
      request_number TEXT NOT NULL UNIQUE,
      version INTEGER NOT NULL DEFAULT 1,
      requester_id TEXT NOT NULL,
      travel_mode TEXT NOT NULL,
      status TEXT NOT NULL,
      current_stage TEXT NOT NULL,
      purpose TEXT,
      trip_type TEXT,
      travel_desk_booking INTEGER DEFAULT 1,
      domestic_international TEXT,
      beneficiary TEXT DEFAULT 'Self',
      from_location TEXT,
      to_location TEXT,
      departure_date TEXT,
      return_date TEXT,
      fare_class TEXT,
      amount REAL,
      currency TEXT DEFAULT 'INR',
      selected_option_json TEXT,
      flight_search_snapshot TEXT,
      cab_json TEXT,
      accommodation_json TEXT,
      train_json TEXT,
      bus_json TEXT,
      boarding_pass_path TEXT,
      boarding_datetime TEXT,
      booked_at TEXT,
      closed_at TEXT,
      exception_flag INTEGER DEFAULT 0,
      exception_reason TEXT,
      remarks TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT,
      FOREIGN KEY (requester_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workflow_events (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_id TEXT,
      actor_name TEXT,
      comment TEXT,
      meta_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES travel_requests(id)
    );

    CREATE TABLE IF NOT EXISTS travel_desk_options (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      option_label TEXT NOT NULL,
      amount REAL,
      remarks TEXT,
      meta_json TEXT,
      selected INTEGER DEFAULT 0,
      created_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES travel_requests(id)
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      uploaded_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES travel_requests(id)
    );

    CREATE INDEX IF NOT EXISTS idx_tr_requester ON travel_requests(requester_id);
    CREATE INDEX IF NOT EXISTS idx_tr_status ON travel_requests(status);
    CREATE INDEX IF NOT EXISTS idx_events_request ON workflow_events(request_id);

    CREATE TABLE IF NOT EXISTS advances (
      id TEXT PRIMARY KEY,
      request_number TEXT NOT NULL UNIQUE,
      requester_id TEXT NOT NULL,
      travel_request_id TEXT,
      travel_request_number TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      purpose TEXT,
      remarks TEXT,
      payment_mode TEXT,
      status TEXT NOT NULL,
      current_stage TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT,
      closed_at TEXT,
      FOREIGN KEY (requester_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      request_number TEXT NOT NULL UNIQUE,
      requester_id TEXT NOT NULL,
      travel_request_id TEXT,
      travel_request_number TEXT,
      expense_types_json TEXT,
      expense_date TEXT,
      amount REAL,
      claimable_amount REAL,
      currency TEXT DEFAULT 'INR',
      lines_json TEXT,
      bulk_food INTEGER DEFAULT 0,
      status TEXT NOT NULL,
      current_stage TEXT NOT NULL,
      remarks TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT,
      closed_at TEXT,
      FOREIGN KEY (requester_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      stage TEXT,
      action TEXT NOT NULL,
      actor_id TEXT,
      actor_name TEXT,
      comment TEXT,
      meta_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_adv_requester ON advances(requester_id);
    CREATE INDEX IF NOT EXISTS idx_exp_requester ON expenses(requester_id);
    CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
  `)
}

export function nowIso() {
  return new Date().toISOString()
}

/** Run multiple statements atomically */
export function withTransaction(fn) {
  const database = getDb()
  database.exec('BEGIN')
  try {
    const result = fn(database)
    database.exec('COMMIT')
    return result
  } catch (err) {
    database.exec('ROLLBACK')
    throw err
  }
}
