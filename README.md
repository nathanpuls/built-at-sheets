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
- `/:username` renders the user's `index` page.
- `/:username/:slug` renders the matching slug from the user's Sheet.

## Master Registry Sheet

Use a public Google Sheet with a tab named `Registry`.

| username | pasted_sheet_url | sheet_id |
| --- | --- | --- |
| nathan | https://docs.google.com/spreadsheets/d/example/edit?usp=sharing | example |

Set `CONFIG.masterSheetId` in `index.html` to the registry Sheet ID.

## User Content Sheet

Each user Sheet should be shared as `Anyone with the link can view`.

| content | slug |
| --- | --- |
| # Hello from my site | index |
| This is my about page. | about |
| https://example.com | links |

Column A can be HTML, Markdown, or a simple redirect URL. Column B is the page slug.

## Apps Script Signup

The `apps-script` folder contains a branded Google Apps Script web app:

- `Code.gs` appends or updates rows in the active spreadsheet's `Registry` tab.
- `Index.html` is the prettier form UI.

Create a Google Sheet for the registry, open Apps Script from that Sheet, add both files, then deploy as a web app.

## Hosting Fallbacks

The project includes `_redirects` for Netlify/Cloudflare Pages and `vercel.json` for Vercel so routes like `/nathan/about` load `index.html`.
