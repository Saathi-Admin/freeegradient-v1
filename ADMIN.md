# Review administration

The public feedback form saves submissions as pending. Sign in at `/studio-vault-7k9m4x/` to approve or reject them. Only visible, approved cards are returned by the public API; email addresses are restricted to authenticated administrators.

All nine existing website cards are imported once into the database and identified as “Existing website card” in the dashboard. They remain layout content, not verified community submissions. The shared source is `src/data/testimonials.json`. Importing uses stable IDs and never resets admin decisions on restart or deployment.

Use **Hide** to take a published card off the website, and **Unhide & publish** to bring it back. **Remove** takes a card off the website and moves it to the recoverable **Removed** tab. Restore brings it back with its previous moderation state. All includes Pending, Approved, Rejected, Hidden and Removed cards. Search filters the current tab while typing. If all cards are hidden or removed, the carousel is hidden while the feedback form remains available; hard-coded cards do not reappear as a fallback. Already-open public pages refresh cards every minute or when the visitor returns to the tab.

## Local preview

Use Node 24 LTS (or Node >=22.19).

1. Run `npm run admin:setup` once. This creates private, Git-ignored `.local/admin.env` and `.local/admin-login.txt` files.
2. Build the site with `npm run build`.
3. Run `npm run serve:reviews`. Open `http://localhost:2000/studio-vault-7k9m4x/` and use the generated login details.

Reviews persist in `.local/reviews.sqlite`. Back up this file while the server is stopped. Do not expose the repository as a web root. The included server only serves `dist/` and API routes. It is a preview server, not a production hosting service.

Rotate the password and session secret with `node scripts/setup-admin.mjs --rotate`, then restart the server. This signs out existing sessions. Never commit or share the `.local/` directory.

## Production on Vercel

Connect this repository to Vercel with Node 24, and create a Neon Postgres database. Set these Vercel environment variables before deploying:

- `DATABASE_URL`: the Neon connection string, kept server-side.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`: use the values generated in `.local/admin.env`, or generate a separate set in a private deployment checkout.

The `api/` functions and `vercel.json` connect the static Astro site to the review service. Tables are created automatically on first API use. Production fails closed if a durable database is missing. A domain purchase is not necessary to test the Vercel preview URL. Environment setup and deployment still need to be completed in the hosting account; local SQLite data is not automatically migrated to production.

Sessions expire after eight hours and use HttpOnly, SameSite=Strict cookies, with Secure on HTTPS. Mutations require same-origin JSON requests; login and submission attempts are rate limited. Review updates reject stale moderation versions. No email notifications are configured: new submissions appear in the Pending tab.

Run `npm run test:reviews`, `npm run check` and `npm run verify:seo-build` after building. Only the owner should receive the admin credentials. Public cards are rendered with text content, never submitted HTML. Do not add sample content to Review/AggregateRating structured data.
