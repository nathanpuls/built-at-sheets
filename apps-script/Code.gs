const REGISTRY_SHEET_NAME = "Registry";

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Start with built.at")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitSite(payload) {
  const username = normalizeUsername(payload.username);
  const pastedUrl = String(payload.sheetUrl || "").trim();
  const sheetId = extractSheetId(pastedUrl);

  if (!username) {
    throw new Error("Choose a username using letters, numbers, or hyphens.");
  }

  if (!sheetId) {
    throw new Error("Paste a valid public Google Sheet URL.");
  }

  const sheet = getRegistrySheet();
  const rows = sheet.getDataRange().getValues();
  const existingIndex = rows.findIndex((row, index) => {
    return index > 0 && String(row[0] || "").trim().toLowerCase() === username;
  });

  const now = new Date();
  const rowValues = [username, pastedUrl, sheetId, "active", now];

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 1, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return {
    ok: true,
    username,
    sheetId
  };
}

function getRegistrySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(REGISTRY_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(REGISTRY_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["username", "pasted_sheet_url", "sheet_id", "status", "updated_at"]);
  }

  return sheet;
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function extractSheetId(value) {
  const input = String(value || "").trim();
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  if (match) {
    return match[1];
  }

  if (/^[a-zA-Z0-9-_]{20,}$/.test(input)) {
    return input;
  }

  return "";
}
