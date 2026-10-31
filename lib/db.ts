import { createClient, type Client, type InValue } from "@libsql/client";
import { randomUUID } from "crypto";

// Local dev: DATABASE_URL=file:./commitpay.db (no token).
// Production: TURSO_DATABASE_URL=libsql://<db>.turso.io + TURSO_AUTH_TOKEN.
const SCHEMA = `
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
    paypal_batch_id TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`;

let _client: Client | null = null;
let _ready: Promise<Client> | null = null;
export function db(): Promise<Client> {
  if (_ready) return _ready;
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./commitpay.db";
  const authToken = url.startsWith("file:") ? undefined : process.env.TURSO_AUTH_TOKEN;
  _client = createClient({ url, authToken });
  const c = _client;
  _ready = c.executeMultiple(SCHEMA).then(() => c).catch((e) => { _ready = null; throw e; });
  return _ready;
}

type Args = InValue[] | Record<string, InValue>;
const plain = (row: any) => (row ? { ...row } : undefined);
export async function all<T = any>(sql: string, args: Args = []): Promise<T[]> {
  const r = await (await db()).execute({ sql, args });
  return r.rows.map(plain) as T[];
}
export async function get<T = any>(sql: string, args: Args = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}
export async function run(sql: string, args: Args = []): Promise<number> {
  return (await (await db()).execute({ sql, args })).rowsAffected;
}
export const uuid = () => randomUUID();

export type Pledge = {
  id: string; user_id: string | null; goal: string; stake_usd: number; currency: string;
  proof_type: "photo" | "link" | "screenshot"; period_end: string;
  beneficiary_type: "charity" | "friend"; beneficiary_email: string; beneficiary_label: string;
  status: string; escape_used: number; paypal_order_id: string | null; paypal_auth_id: string | null;
  paypal_capture_id: string | null; paypal_payout_batch_id: string | null; created_at: string; updated_at: string;
};
export const getPledge = (id: string) => get<Pledge>("SELECT * FROM pledges WHERE id=?", [id]);
export async function setPledge(id: string, fields: Partial<Pledge>) {
  const keys = Object.keys(fields) as (keyof Pledge)[];
  if (!keys.length) return;
  await run(`UPDATE pledges SET ${keys.map((k) => `${k}=?`).join(",")}, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [...keys.map((k) => (fields[k] ?? null) as InValue), id]);
}
