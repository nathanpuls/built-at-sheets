const REGISTRY_SHEET_NAME = "Registry";
const HEADERS = ["username", "pasted_sheet_url", "sheet_id", "hidden", "created_at", "updated_at"];
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 24;
const USERNAME_PATTERN = /^[a-z0-9]+$/;
const RESERVED_USERNAMES = ["app", "api", "admin", "www", "mail", "help", "support", "claim", "login", "signup"];

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Claim a built.at name")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");

    if (payload.action === "checkUsername") {
      return jsonResponse(checkUsername(payload.username));
    }

    if (payload.action === "register") {
      return jsonResponse(submitSite(payload));
    }

    return jsonResponse({
      ok: false,
      message: "Unknown action."
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message || String(error)
    });
  }
}

function checkUsername(value) {
  const username = normalizeUsername(value);
  const validation = validateUsername(username);

  if (!validation.ok) {
    return {
      available: false,
      username,
      message: validation.message
    };
  }

  if (usernameExists(username)) {
    return {
      available: false,
      username,
      message: "That name is already taken."
    };
  }

  return {
    available: true,
    username,
    message: `${username} is available.`
  };
}

function submitSite(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const username = normalizeUsername(payload.username);
    const validation = validateUsername(username);
    const pastedUrl = String(payload.sheetUrl || "").trim();
    const sheetId = extractSheetId(pastedUrl);

    if (!validation.ok) {
      throw new Error(validation.message);
    }

    if (!sheetId) {
      throw new Error("Paste a valid public Google Sheet sharing URL.");
    }

    if (usernameExists(username)) {
      throw new Error("That name is already taken.");
    }

    const sheet = getRegistrySheet();
    const now = new Date();

    sheet.appendRow([
      username,
      pastedUrl,
      sheetId,
      false,
      now,
      now
    ]);

    formatRegistrySheet(sheet);

    return {
      ok: true,
      username,
      sheetId,
      url: `https://built.at/${username}`
    };
  } finally {
    lock.releaseLock();
  }
}

function usernameExists(username) {
  const sheet = getRegistrySheet();
  const values = sheet.getDataRange().getValues();

  return values.some((row, index) => {
    return index > 0 && String(row[0] || "").trim().toLowerCase() === username;
  });
}

function getRegistrySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(REGISTRY_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(REGISTRY_SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    formatRegistrySheet(sheet);
    return sheet;
  }

  if (ensureHeaders(sheet)) {
    formatRegistrySheet(sheet);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = HEADERS.some((header, index) => {
    return String(current[index] || "").trim().toLowerCase() !== header;
  });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  return needsHeaders;
}

function formatRegistrySheet(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground("#111827")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  sheet.getRange("D2:D1000").insertCheckboxes();
  sheet.getRange("E2:F1000").setNumberFormat("yyyy-mm-dd h:mm AM/PM");
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 420);
  sheet.setColumnWidth(3, 310);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 190);
  sheet.setColumnWidth(6, 190);
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function validateUsername(username) {
  if (!username) {
    return {
      ok: false,
      message: "Choose a username."
    };
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      message: `Use at least ${USERNAME_MIN_LENGTH} characters.`
    };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `Use ${USERNAME_MAX_LENGTH} characters or fewer.`
    };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      message: "Use only letters and numbers."
    };
  }

  if (RESERVED_USERNAMES.indexOf(username) >= 0) {
    return {
      ok: false,
      message: "That name is reserved."
    };
  }

  return {
    ok: true,
    message: ""
  };
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
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
