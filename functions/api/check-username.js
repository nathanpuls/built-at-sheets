import { getRegistryDb, json, normalizeUsername, usernameExists, validateUsername } from "./_shared.js";

export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const username = normalizeUsername(url.searchParams.get("username"));
    const validationMessage = validateUsername(username);
    const db = getRegistryDb(env);

    if (validationMessage) {
      return json({
        available: false,
        username,
        message: validationMessage
      });
    }

    if (await usernameExists(db, username)) {
      return json({
        available: false,
        username,
        message: "That name is already taken."
      });
    }

    return json({
      available: true,
      username,
      message: `${username} is available.`
    });
  } catch (error) {
    console.error(error);
    return json({
      available: false,
      message: "Could not check that name right now."
    }, { status: 500 });
  }
}
