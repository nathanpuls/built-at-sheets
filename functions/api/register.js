import { APPS_SCRIPT_URL, extractSheetId, json, normalizeUsername, usernameExists, validateUsername } from "./_shared.js";

export async function onRequestPost({ request }) {
  try {
    const payload = await request.json();
    const username = normalizeUsername(payload.username);
    const validationMessage = validateUsername(username);
    const sheetUrl = String(payload.sheetUrl || "").trim();
    const sheetId = extractSheetId(sheetUrl);

    if (validationMessage) {
      return json({ ok: false, message: validationMessage }, { status: 400 });
    }

    if (!sheetId) {
      return json({ ok: false, message: "Paste a valid public Google Sheet sharing URL." }, { status: 400 });
    }

    if (await usernameExists(username)) {
      return json({ ok: false, message: "That name is already taken." }, { status: 409 });
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "register",
        username,
        sheetUrl
      })
    });
    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      if (text.includes("Script function not found: doPost")) {
        return json({
          ok: false,
          message: "The registration backend needs to be redeployed."
        }, { status: 502 });
      }

      return json({
        ok: false,
        message: "The registration backend returned an unexpected response."
      }, { status: 502 });
    }

    if (!response.ok || !result.ok) {
      return json({
        ok: false,
        message: result.message || "Could not claim that name."
      }, { status: response.ok ? 400 : response.status });
    }

    return json(result);
  } catch (error) {
    return json({
      ok: false,
      message: "Could not claim that name right now."
    }, { status: 500 });
  }
}
