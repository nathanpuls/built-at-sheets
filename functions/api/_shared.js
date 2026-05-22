export const RESERVED_USERNAMES = new Set(["app", "api", "admin", "www", "mail", "help", "support", "claim", "login", "signup"]);

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {})
    }
  });
}

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function validateUsername(username) {
  if (!username) return "Choose a username.";
  if (username.length < 3) return "Use at least 3 characters.";
  if (username.length > 24) return "Use 24 characters or fewer.";
  if (!/^[a-z0-9]+$/.test(username)) return "Use only letters and numbers.";
  if (RESERVED_USERNAMES.has(username)) return "That name is reserved.";
  return "";
}

export function extractSheetId(value) {
  const input = String(value || "").trim();
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(input)) return input;
  return "";
}

export function getRegistryDb(env) {
  if (!env?.REGISTRY_DB) {
    throw new Error("REGISTRY_DB D1 binding is not configured.");
  }

  return env.REGISTRY_DB;
}

export function booleanValue(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  return ["1", "true", "yes"].includes(String(value).trim().toLowerCase());
}

export function serializeSite(row, options = {}) {
  if (!row) return null;

  const site = {
    username: row.username,
    hidden: booleanValue(row.hidden),
    active: booleanValue(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  if (options.includeSheet || (!site.hidden && site.active)) {
    site.sheetUrl = row.sheet_url;
    site.sheetId = row.sheet_id;
  }

  return site;
}

export async function getSiteByUsername(db, username) {
  return db
    .prepare(
      `SELECT username, sheet_url, sheet_id, hidden, active, created_at, updated_at
       FROM sites
       WHERE username = ?`
    )
    .bind(username)
    .first();
}

export async function usernameExists(db, username) {
  const row = await db
    .prepare("SELECT 1 AS found FROM sites WHERE username = ?")
    .bind(username)
    .first();

  return Boolean(row);
}
