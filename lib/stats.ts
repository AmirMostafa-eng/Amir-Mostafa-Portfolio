// Visitor stats store. Uses Upstash Redis over REST when KV_REST_API_URL and
// KV_REST_API_TOKEN are set (Vercel Marketplace -> Upstash). In local dev
// without those vars it falls back to a JSON file so the feature is testable.

import { promises as fs } from "fs";
import path from "path";

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const LOCAL_FILE = path.join(process.cwd(), ".stats-local.json");

export type VisitInput = { id: string; page: string; ref: string; country: string };

export type DayStat = { date: string; total: number; unique: number };

export type Stats = {
  unique: number;
  total: number;
  returning: number;
  today: number;
  week: DayStat[];
  pages: [string, number][];
  refs: [string, number][];
  countries: [string, number][];
  lastVisit: string | null;
};

function todayKey(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

// ---------- Upstash REST ----------

async function kv<T = unknown>(commands: unknown[][]): Promise<T[]> {
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV pipeline failed: ${res.status}`);
  const json = (await res.json()) as { result: T }[];
  return json.map((r) => r.result);
}

async function kvRecord({ id, page, ref, country }: VisitInput): Promise<void> {
  const day = todayKey();
  const [added] = await kv<number>([
    ["SADD", "visitors:devices", id],
    ["HINCRBY", `visitors:daily:${day}`, "total", 1],
    ["HINCRBY", "visitors:pages", page, 1],
    ["HINCRBY", "visitors:refs", ref, 1],
    ["HINCRBY", "visitors:countries", country, 1],
    ["HSET", "visitors:meta", "last", new Date().toISOString()],
  ]);
  if (added === 1) {
    await kv([["HINCRBY", `visitors:daily:${day}`, "unique", 1]]);
  } else {
    await kv([["HINCRBY", "visitors:meta", "returning", 1]]);
  }
}

function hashToPairs(result: unknown): [string, number][] {
  if (!Array.isArray(result)) return [];
  const out: [string, number][] = [];
  for (let i = 0; i + 1 < result.length; i += 2) {
    out.push([String(result[i]), Number(result[i + 1]) || 0]);
  }
  return out.sort((a, b) => b[1] - a[1]);
}

async function kvGetStats(): Promise<Stats> {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) days.push(todayKey(i));
  const cmds: unknown[][] = [
    ["SCARD", "visitors:devices"],
    ["HGETALL", "visitors:meta"],
    ["HGETALL", "visitors:pages"],
    ["HGETALL", "visitors:refs"],
    ["HGETALL", "visitors:countries"],
    ...days.map((d) => ["HGETALL", `visitors:daily:${d}`]),
  ];
  const r = await kv(cmds);
  const week: DayStat[] = days.map((date, i) => {
    const pairs = hashToPairs(r[5 + i]);
    const get = (k: string) => pairs.find(([key]) => key === k)?.[1] ?? 0;
    return { date, total: get("total"), unique: get("unique") };
  });
  const meta = new Map(hashToPairs(r[1]));
  // raw hash values are strings; "last" is an ISO timestamp, "returning" a count
  const metaRaw = r[1];
  const unique = Number(r[0]) || 0;
  const returning = meta.get("returning") ?? 0;
  let lastVisit: string | null = null;
  if (Array.isArray(metaRaw)) {
    const idx = metaRaw.indexOf("last");
    if (idx >= 0 && typeof metaRaw[idx + 1] === "string") lastVisit = metaRaw[idx + 1];
  }
  return {
    total: unique + returning,
    unique,
    returning,
    today: week[6].total,
    week,
    pages: hashToPairs(r[2]).slice(0, 8),
    refs: hashToPairs(r[3]).slice(0, 8),
    countries: hashToPairs(r[4]).slice(0, 8),
    lastVisit,
  };
}

// ---------- Local file fallback (dev only) ----------

type LocalData = {
  devices: string[];
  total: number;
  returning: number;
  daily: Record<string, { total: number; unique: number }>;
  pages: Record<string, number>;
  refs: Record<string, number>;
  countries: Record<string, number>;
  last: string | null;
};

const EMPTY: LocalData = { devices: [], total: 0, returning: 0, daily: {}, pages: {}, refs: {}, countries: {}, last: null };

async function readLocal(): Promise<LocalData> {
  try {
    return { ...EMPTY, ...(JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Partial<LocalData>) };
  } catch {
    return { ...EMPTY };
  }
}

async function localRecord({ id, page, ref, country }: VisitInput): Promise<void> {
  const d = await readLocal();
  const day = todayKey();
  d.daily[day] = d.daily[day] ?? { total: 0, unique: 0 };
  d.total += 1;
  d.daily[day].total += 1;
  if (d.devices.includes(id)) {
    d.returning += 1;
  } else {
    d.devices.push(id);
    d.daily[day].unique += 1;
  }
  d.pages[page] = (d.pages[page] ?? 0) + 1;
  d.refs[ref] = (d.refs[ref] ?? 0) + 1;
  d.countries[country] = (d.countries[country] ?? 0) + 1;
  d.last = new Date().toISOString();
  await fs.writeFile(LOCAL_FILE, JSON.stringify(d));
}

function recToPairs(rec: Record<string, number>): [string, number][] {
  return Object.entries(rec).sort((a, b) => b[1] - a[1]);
}

async function localGetStats(): Promise<Stats> {
  const d = await readLocal();
  const week: DayStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = todayKey(i);
    const day = d.daily[date] ?? { total: 0, unique: 0 };
    week.push({ date, ...day });
  }
  return {
    total: d.total,
    unique: d.devices.length,
    returning: d.returning,
    today: week[6].total,
    week,
    pages: recToPairs(d.pages).slice(0, 8),
    refs: recToPairs(d.refs).slice(0, 8),
    countries: recToPairs(d.countries).slice(0, 8),
    lastVisit: d.last,
  };
}

// ---------- Public API ----------

export function recordVisit(input: VisitInput): Promise<void> {
  return KV_URL && KV_TOKEN ? kvRecord(input) : localRecord(input);
}

export function getStats(): Promise<Stats> {
  return KV_URL && KV_TOKEN ? kvGetStats() : localGetStats();
}
