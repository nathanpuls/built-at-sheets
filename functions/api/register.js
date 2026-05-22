import { extractSheetId, getRegistryDb, json, normalizeUsername, usernameExists, validateUsername } from "./_shared.js";

export async function onRequestPost({ env, request }) {
  try {
    const payload = await request.json();
    const username = normalizeUsername(payload.username);
    const validationMessage = validateUsername(username);
    const sheetUrl = String(payload.sheetUrl || "").trim();
    const sheetId = extractSheetId(sheetUrl);
    const db = getRegistryDb(env);

    if (validationMessage) {
      return json({ ok: false, message: validationMessage }, { status: 400 });
    }

    if (!sheetId) {
      return json({ ok: false, message: "Paste a valid public Google Sheet sharing URL." }, { status: 400 });
    }

    if (await usernameExists(db, username)) {
      return json({ ok: false, message: "That name is already taken." }, { status: 409 });
    }

    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO sites (username, sheet_url, sheet_id, hidden, active, created_at, updated_at)
         VALUES (?, ?, ?, 0, 1, ?, ?)`
      )
      .bind(username, sheetUrl, sheetId, now, now)
      .run();

    return json({
      ok: true,
      username,
      sheetId,
      url: `https://built.at/${username}`
    });
  } catch (error) {
    if (String(error?.message || error).includes("UNIQUE constraint failed")) {
      return json({ ok: false, message: "That name is already taken." }, { status: 409 });
    }

    console.error(error);
    return json({
      ok: false,
      message: "Could not claim that name right now."
    }, { status: 500 });
  }
}
