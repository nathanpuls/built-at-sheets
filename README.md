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

Current registry:
[built.at Registry](https://docs.google.com/spreadsheets/d/1gL740Jji_spSBGuTqcoScqJOI6usz0J1vzn2s3x5hQg/edit)

| username | pasted_sheet_url | sheet_id | hidden | created_at | updated_at |
| --- | --- | --- | --- | --- | --- |
| nathan | https://docs.google.com/spreadsheets/d/example/edit?usp=sharing | example | FALSE | 2026-05-21 1:00 PM | 2026-05-21 1:00 PM |

The deployed app reads this Sheet ID from `CONFIG.masterSheetId` in `index.html`.

For G-Viz to work in the public site, the registry Sheet and each user content Sheet need to be shared as `Anyone with the link can view`.

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

- `Code.gs` validates usernames, checks availability, extracts Sheet IDs, and appends rows to the active spreadsheet's `Registry` tab.
- `Index.html` is the branded signup UI with live availability feedback.

Open Apps Script from the registry Sheet, add both files, then deploy as a web app.

Username rules:

- 3-24 characters
- letters and numbers only
- stored lowercase
- existing usernames cannot be claimed again

## Hosting Fallbacks

The project includes `_redirects` for Netlify/Cloudflare Pages and `vercel.json` for Vercel so routes like `/nathan/about` load `index.html`.
