import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// DATABASE_URL: file:./commitpay.db (local) or file:/data/commitpay.db (Render disk)
export function dbPath(url = process.env.DATABASE_URL || "file:./commitpay.db") {
  let f = url.replace(/^file:(\/\/)?/, "");
  if (url.startsWith("file://") && !f.startsWith("/") && !f.startsWith(".")) f = "/" + f;
  return path.resolve(process.cwd(), f);
}

// Schema mirrors docs/design.md §3
let _db: Database.Database | null = null;
export function db() {
  if (_db) return _db;
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  _db = new Database(file);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
  CREATE TABLE IF NOT EXISTS pledges (
    id TEXT PRIMARY KEY, user_id TEXT, goal TEXT NOT NULL, stake_usd REAL NOT NULL, currency TEXT DEFAULT 'USD',
    proof_type TEXT CHECK(proof_type IN ('photo','link','screenshot')), period_end TEXT,
    beneficiary_type TEXT CHECK(beneficiary_type IN ('charity','friend')), beneficiary_email TEXT, beneficiary_label TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT', escape_used INTEGER NOT NULL DEFAULT 0,
    paypal_order_id TEXT, paypal_auth_id TEXT, paypal_capture_id TEXT, paypal_payout_batch_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS proofs (
    id TEXT PRIMARY KEY, pledge_id TEXT REFERENCES pledges(id), kind TEXT, storage_url TEXT, source_url TEXT,
    ai_verdict TEXT DEFAULT 'pending', ai_reasons TEXT DEFAULT '[]', critic_flags TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS escape_sessions (
    id TEXT PRIMARY KEY, pledge_id TEXT UNIQUE REFERENCES pledges(id), transcript TEXT DEFAULT '[]',
    verdict TEXT DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS webhook_events (
    paypal_event_id TEXT PRIMARY KEY, event_type TEXT, payload TEXT, processed_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS payout_log (
    id TEXT PRIMARY KEY, pledge_id TEXT REFERENCES pledges(id), amount_usd REAL, receiver TEXT, status TEXT,
    paypal_batch_id TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
  return _db;
}
export const uuid = () => randomUUID();

export type Pledge = {
  id: string; user_id: string | null; goal: string; stake_usd: number; currency: string;
  proof_type: "photo" | "link" | "screenshot"; period_end: string;
  beneficiary_type: "charity" | "friend"; beneficiary_email: string; beneficiary_label: string;
  status: string; escape_used: number; paypal_order_id: string | null; paypal_auth_id: string | null;
  paypal_capture_id: string | null; paypal_payout_batch_id: string | null; created_at: string; updated_at: string;
};
export const getPledge = (id: string) => db().prepare("SELECT * FROM pledges WHERE id=?").get(id) as Pledge | undefined;
export function setPledge(id: string, fields: Partial<Pledge>) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  db().prepare(`UPDATE pledges SET ${keys.map((k) => `${k}=@${k}`).join(",")}, updated_at=CURRENT_TIMESTAMP WHERE id=@id`)
    .run({ ...fields, id });
}
