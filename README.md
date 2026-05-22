# built.at Sheets Prototype

A tiny static prototype for websites powered by Google Sheets.

## Local Preview

```bash
npm start
```

Open `http://127.0.0.1:4175`.

## Cloudflare Pages

Production deploys from the `main` branch to `https://built-at-sheets.pages.dev`.

## Routing

- `/` renders the built.at marketing page.
- `/app/claim` renders the built.at-branded signup form.
- `/:username` renders the user's `index` page.
- `/:username/:slug` renders the matching slug from the user's Sheet.

## D1 Registry

The built.at registry lives in Cloudflare D1. Google Sheets are only used for
user site content.

Cloudflare Pages Functions expect a D1 binding named `REGISTRY_DB`.

The registry table is:

| username | sheet_url | sheet_id | hidden | active | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| test | https://docs.google.com/spreadsheets/d/example/edit?usp=sharing | example | 0 | 1 | 2026-05-21T00:00:00.000Z | 2026-05-21T00:00:00.000Z |

Setup:

```bash
npx wrangler d1 create built-at-registry
npx wrangler d1 execute built-at-registry --file migrations/0001_create_sites.sql --remote
npx wrangler d1 execute built-at-registry --file seeds/registry.sql --remote
```

Then add the D1 database to the Cloudflare Pages project as the `REGISTRY_DB`
binding, or copy `wrangler.example.toml` to `wrangler.toml` and fill in the
real database IDs.

For quick manual admin changes, use the D1 table editor in Cloudflare or run:

```bash
npx wrangler d1 execute built-at-registry --remote --command "UPDATE sites SET hidden = 1, updated_at = datetime('now') WHERE username = 'test4'"
npx wrangler d1 execute built-at-registry --remote --command "UPDATE sites SET hidden = 0, updated_at = datetime('now') WHERE username = 'test4'"
```

## User Content Sheet

Users should start by copying the template Sheet, editing their copy, and sharing
that copy as `Anyone with the link can view` before claiming a built.at name.

Template:
https://docs.google.com/spreadsheets/d/102t_BkHXsSCLFgyKJma5l62bnngHUaI69fquUp6xnxs/copy

| content | slug |
| --- | --- |
| # Hello from my site | index |
| This is my about page. | about |
| https://example.com | links |

Column A can be HTML, Markdown, or a simple redirect URL. Column B is the page slug.

## Signup

The public signup form is served by Cloudflare Pages at `/app/claim`.

The intended signup flow is:

1. Copy the template Sheet.
2. Make the copied Sheet public as `Anyone with the link can view`.
3. Choose a username and paste the public copied Sheet URL.

Cloudflare Pages Functions handle:

- `/api/check-username`
- `/api/register`
- `/api/site`

The `apps-script` folder is legacy and is no longer needed for the registry
once D1 is bound in Cloudflare.

Username rules:

- 3-24 characters
- letters and numbers only
- stored lowercase
- existing usernames cannot be claimed again

## Hosting Fallbacks

The project includes `_redirects` for Netlify/Cloudflare Pages and `vercel.json` for Vercel so routes like `/nathan/about` load `index.html`.
