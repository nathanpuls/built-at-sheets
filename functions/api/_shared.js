export const REGISTRY_SHEET_ID = "1gL740Jji_spSBGuTqcoScqJOI6usz0J1vzn2s3x5hQg";
export const REGISTRY_SHEET_NAME = "Registry";
export const REGISTRY_RANGE = "A:F";
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRDNrYYSEdu4pXTVMRtjuVmRzJK9htqPkgj6wyvG2nG_CEkv5nW6Q2zKIbu7DCHJSy/exec";
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

export async function getRegistryRows() {
  const url =
    `https://docs.google.com/spreadsheets/d/${REGISTRY_SHEET_ID}/gviz/tq` +
    `?tqx=${encodeURIComponent("out:json")}` +
    `&sheet=${encodeURIComponent(REGISTRY_SHEET_NAME)}` +
    `&range=${encodeURIComponent(REGISTRY_RANGE)}`;
  const response = await fetch(url, {
    cf: {
      cacheTtl: 10,
      cacheEverything: true
    }
  });

  if (!response.ok) {
    throw new Error(`Registry lookup failed with HTTP ${response.status}.`);
  }

  const text = await response.text();
  const jsonText = text
    .replace(/^[\s\S]*?google\.visualization\.Query\.setResponse\(/, "")
    .replace(/\);\s*$/, "");
  const data = JSON.parse(jsonText);

  if (data.status === "error") {
    throw new Error(data.errors?.map((error) => error.detailed_message || error.message).join("; ") || "Google Sheets returned an error.");
  }

  return (data.table?.rows || []).map((row) => (row.c || []).map((cell) => cell?.v ?? ""));
}

export async function usernameExists(username) {
  const rows = await getRegistryRows();
  return rows.some((row, index) => {
    if (index === 0 && String(row[0] || "").trim().toLowerCase() === "username") return false;
    return String(row[0] || "").trim().toLowerCase() === username;
  });
}
