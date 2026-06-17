# SkillBid

A two-sided marketplace connecting SMEs with short-term tasks to verified university students, with Adecco acting as Employer of Record for each assignment.

This is a real, working application: it has its own database, real password-based accounts for both companies and students, and every flow described below actually persists and updates data for every visitor — not a demo that resets when you close the tab.

## What's included

- Landing page, About, and Terms / Privacy / Cookie pages (Netherlands/Maastricht framing)
- Separate sign-up and login for companies (SMEs) and students, with automatic verification (recognised university email domains, plausible VAT number format)
- Task posting with milestones, browsing/filtering, applications ("basket"), and applicant review
- A three-step Adecco employment contract flow (employee details → company signs → employee signs), with the 15% platform commission shown throughout
- Milestone submission, approval/changes-requested, and task completion
- In-task messaging, a notification bell, and two-way ratings after a task completes

## Tech stack

- **Next.js 14** (App Router) — both the frontend pages and the `/api/*` backend routes
- **PostgreSQL** — plain SQL via the `postgres` package (no ORM, see `db/schema.sql`)
- **bcryptjs + JWT cookies** — custom auth, no third-party auth provider required

## Local setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (any Postgres database — see deployment section below for a free hosted option) and a real `JWT_SECRET`.
3. Apply the database schema:
   ```
   npm run migrate
   ```
4. (Optional but recommended) Load demo data — a handful of example companies, students, tasks and an in-progress contract, so the app isn't empty on first run:
   ```
   npm run seed
   ```
5. Run it:
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

**Demo accounts** (only exist if you ran `npm run seed`): `hr@greenfieldslogistics.nl` / `demo1234` (company), `s.okafor@student.maastrichtuniversity.nl` / `demo1234` (student).

## Deploying it for real

You need two free accounts: one for the database, one for hosting.

**1. Database — [Neon](https://neon.tech)** (Postgres, free tier, no credit card)
   - Create an account and a new project.
   - Copy the connection string it gives you (starts with `postgresql://`).
   - From your computer, with that connection string set as `DATABASE_URL` in `.env`, run `npm run migrate` once to create the tables. Run `npm run seed` too if you want the demo data on the live site — **read the security note below first if so.**

**2. Hosting — [Vercel](https://vercel.com)**
   - Push this project to a GitHub repository.
   - In Vercel, "Add New Project" → import that repository. It will detect Next.js automatically.
   - Under Environment Variables, add `DATABASE_URL` (the Neon connection string) and `JWT_SECRET` (a long random string — run `openssl rand -base64 32` to generate one, don't reuse the example value).
   - Deploy. You'll get a live `*.vercel.app` URL.
   - Note: Vercel's free Hobby plan is for non-commercial use. Once SkillBid is actually taking real companies and charging commission, you'd move to a paid plan (Pro is $20/month at the time of writing).

## Important things to know before treating this as production-ready

- **The Adecco contract flow is a UI and data model for the workflow, not a live integration.** Signing a contract in the app records the agreed terms and signatures in your database — it does not create a real employment relationship with Adecco. You'd need an actual agreement and integration (or manual process) with Adecco for that step to be real.
- **VAT and university verification are basic checks, not real ones.** VAT numbers are only checked against a plausible format (not a real VIES registry lookup), and university emails are only checked against a domain allowlist in `lib/validators.js` (not real enrollment verification). Both are reasonable starting points, not compliance-grade checks.
- **No real payments yet.** Remuneration and the 15% commission are calculated and displayed, but no money actually moves. You'd want to add a real payment/escrow provider (e.g. Mollie, given the Dutch context, or Stripe) before handling real transactions.
- **Deliverables are text/links, not file uploads.** Students describe or link to their work rather than uploading files directly. Adding real file storage (e.g. Vercel Blob or S3-compatible storage) is a reasonable next step.
- **The legal pages are placeholder text**, written to reflect a Netherlands/Maastricht launch and GDPR basics, but they are not legal advice and should be reviewed by a qualified Dutch lawyer before relying on them.
- **If you seed demo data on a live, public deployment**, anyone who reads this README knows the demo account passwords (`demo1234`). Either skip seeding in production, or change/delete those accounts before real users arrive.

## Project structure

```
app/                   pages (App Router) and /api routes
components/            shared UI (nav, footer, ticket cards, contract document, etc.)
lib/                   db connection, auth helpers, validators, formatting
db/schema.sql          full database schema
db/migrate.js          applies schema.sql to whatever DATABASE_URL points to
db/seed.js             loads demo data
test/integration.js    end-to-end test hitting a running server + real database
```

## Reasonable next features

Dispute/flagging workflow, an internal SkillBid admin view, file uploads for deliverables, real payment/escrow, password reset, and rate limiting on the auth endpoints would all be worth adding before a public launch.
