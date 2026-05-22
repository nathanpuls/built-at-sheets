import { getRegistryDb, getSiteByUsername, json, normalizeUsername, serializeSite, validateUsername } from "./_shared.js";

export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const username = normalizeUsername(url.searchParams.get("username"));
    const validationMessage = validateUsername(username);

    if (validationMessage) {
      return json({ ok: false, message: validationMessage }, { status: 400 });
    }

    const db = getRegistryDb(env);
    const site = serializeSite(await getSiteByUsername(db, username));

    if (!site) {
      return json({ ok: false, message: "Site not found." }, { status: 404 });
    }

    return json({ ok: true, site });
  } catch (error) {
    console.error(error);
    return json({
      ok: false,
      message: "Could not load that site right now."
    }, { status: 500 });
  }
}
