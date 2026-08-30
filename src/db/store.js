// Browser-local database for the demo. Everything the agency "feeds in" lives
// here and survives a refresh. The Spring Boot + PostgreSQL backend documented in
// docs/BACKEND_SPEC.md is a drop-in replacement: same tables, same shapes.

import { buildSeed } from './seed';

const DB_KEY = 'hip_db_v3';
const TABLES = ['companies', 'users', 'jobs', 'candidates', 'matches'];

function emptyDb() {
  return { companies: [], users: [], jobs: [], candidates: [], matches: [], meta: { seededAt: null } };
}

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cache = { ...emptyDb(), ...parsed };
      return cache;
    }
  } catch {
    // corrupted store — fall through to a fresh seed
  }
  cache = buildSeed();
  persist();
  return cache;
}

function persist() {
  localStorage.setItem(DB_KEY, JSON.stringify(cache));
  window.dispatchEvent(new Event('hip-db-change'));
}

export function resetDb() {
  cache = buildSeed();
  persist();
  return cache;
}

let idCounter = Date.now();
export function newId(prefix) {
  idCounter += 1;
  return `${prefix}_${idCounter.toString(36)}`;
}

function assertTable(table) {
  if (!TABLES.includes(table)) throw new Error(`Unknown table: ${table}`);
}

export function getAll(table) {
  assertTable(table);
  return [...read()[table]];
}

export function getById(table, id) {
  assertTable(table);
  return read()[table].find((row) => row.id === id) || null;
}

export function where(table, predicate) {
  assertTable(table);
  return read()[table].filter(predicate);
}

export function insert(table, row) {
  assertTable(table);
  const record = { id: row.id || newId(table.slice(0, 3)), createdAt: row.createdAt || new Date().toISOString(), ...row };
  read()[table].push(record);
  persist();
  return record;
}

export function insertMany(table, rows) {
  assertTable(table);
  const records = rows.map((row) => ({
    id: row.id || newId(table.slice(0, 3)),
    createdAt: row.createdAt || new Date().toISOString(),
    ...row,
  }));
  read()[table].push(...records);
  persist();
  return records;
}

export function update(table, id, patch) {
  assertTable(table);
  const db = read();
  let updated = null;
  db[table] = db[table].map((row) => {
    if (row.id === id) {
      updated = { ...row, ...patch };
      return updated;
    }
    return row;
  });
  cache = db;
  persist();
  return updated;
}

export function removeWhere(table, predicate) {
  assertTable(table);
  const db = read();
  db[table] = db[table].filter((row) => !predicate(row));
  cache = db;
  persist();
}

export function getMeta() {
  return { ...read().meta };
}

export function snapshot() {
  return JSON.parse(JSON.stringify(read()));
}
