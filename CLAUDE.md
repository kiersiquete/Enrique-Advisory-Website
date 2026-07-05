# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (EN/ES) marketing site + self-assessment tool for Gilbert Devlyn, a family-enterprise
advisor. Visitors land on a consulting-style marketing site, optionally take a "family enterprise
self-assessment" (internally/in code called the "diagnostic"), get a scored radar-chart result, can
invite up to 2 other family members into a comparison group, and receive email + PDF reports.

See `ASSESSMENT_ARCHITECTURE.md` for the full product/data-model spec (respondents, sessions, groups,
invitations, email events, API shape, phased build plan) — read it before making non-trivial changes
to the assessment flow, scoring, or backend persistence.

## Commands

```bash
npm run dev          # runs API (Express, port 5174) + Vite web (port 5173) concurrently
npm run dev:web       # Vite only
npm run dev:api       # Express API only (node --use-system-ca server/index.js)
npm run build          # vite build
npm run preview         # vite preview

npm run verify           # full gate: syntax-checks server/api files, then all verify:* scripts, then build
npm run verify:config    # scripts/verify-config.mjs
npm run verify:lockfile  # scripts/verify-lockfile.mjs
npm run verify:scoring   # scripts/verify-scoring.mjs
npm run verify:api       # scripts/verify-api-routes.mjs
npm run verify:airtable  # scripts/verify-airtable-persistence.mjs
npm run verify:ui        # scripts/verify-ui-copy.mjs
npm run verify:serverless # scripts/verify-serverless-handlers.mjs
```

There is no test framework (no Jest/Vitest) — correctness is checked via the `scripts/verify-*.mjs`
scripts above (plain Node scripts, run individually with `node scripts/<name>.mjs`) plus manual
browser verification. When changing scoring, Airtable field mapping, API routes, or UI copy, run the
matching `verify:*` script before calling the work done.

Local dev needs a `.env` (see `.env.example`) with Airtable credentials/table names and SMTP
credentials — without them, Airtable persistence and email sending will fail at runtime (dev server
still boots).

## Architecture

**Two backend entry points share the same logic, for two deploy targets:**
- `server/index.js` — Express app (`createApp()`), used for local dev (`npm run dev:api`) and
  presumably a long-running host.
- `api/*.js` — Vercel serverless functions (`api/results.js`, `api/groups.js`, `api/invitations.js`,
  `api/summary-pdf.js`, `api/advisor-report-pdf.js`), used in production per `vercel.json`
  (all non-`/api/*` paths rewrite to `index.html` — this is an SPA).

  Both entry points import the **same** business logic modules — `server/airtable.js` (persistence),
  `server/email.js` (transactional email), `server/scoring.js` (`normalizeAssessmentSubmission`),
  `server/summary-report.js` (PDF generation for respondent + advisor reports). When changing
  request-handling behavior, update logic in these shared modules, not duplicated per-entry-point
  code — and check both `server/index.js` and the matching `api/*.js` file stay in sync (there is no
  shared route-handler function; the Express routes and serverless handlers are hand-mirrored).

**Frontend is one large file:** `src/App.jsx` (~5,600 lines) contains the entire React app — no
router library. Routing is hand-rolled via `SCREEN_ROUTES`/`ROUTE_SCREENS` (a path↔screen-name map)
plus `window.history.pushState`/`popstate`, driven by a single `screen` state value in the top-level
`App()` component (~line 983). Screens: `home` (`/`), `about` (`/about`), `services` (`/services`),
`assessment-home` (`/diagnostic` — covers intake, questionnaire, results, invite, and comparison,
switched internally by further state/query params like `?group=` and `?view=comparison`).

Renaming the `/diagnostic` route would break previously saved/shared links — don't do it even though
the user-facing terminology is "self-assessment" (see Terminology rule below).

Key top-level components in `App.jsx` (grep `^function ` to find current line numbers — the file
changes often):
- `HomePage`, `ServicesPage`, `AboutPage` — marketing pages.
- `AssessmentProfileIntake` → `AssessmentFlow` → `ResultsScreen` → `InviteFamilyPanel` →
  `ComparisonScreen` — the assessment funnel, in order.
- `SiteHeader`, `SiteFooter`, `CookieConsentBanner`, `PrivacyPolicyModal`, `LanguageToggle` — shared
  chrome.

**Copy and data:** `src/data/assessment.js` (~2,400 lines) holds *all* bilingual UI strings and the
question bank, structured as parallel `en: {...}` / `es: {...}` objects — never a shared/flat key
list. `PHONE_COUNTRY_OPTIONS` (dial codes) also lives here.

**Scoring:** `src/utils/results.js` (`calculateResults`) computes per-pillar and overall scores on
the client from raw answers; `server/scoring.js` (`normalizeAssessmentSubmission`) validates/reshapes
a submission server-side before persistence. Answers are `0`–`5` or the sentinel string `"unknown"`
(`UNKNOWN_ANSWER`) — unknown answers are excluded from numeric averages but counted separately
per pillar (`unknownByPillar`) and surface as a "low confidence" / transparency signal. A pillar with
zero numeric answers must not silently score as `0` — this has been an active bug area (radar chart
plotting all-unknown pillars as a worst-possible score); check `src/components/RadarPanel.jsx`'s
handling of `score === null` when touching this path.

**Persistence:** Airtable, via `server/airtable.js` — table/base IDs come from env vars (see
`.env.example`). No local DB.

**Email + PDF:** `server/email.js` sends transactional email (invitation, respondent summary, advisor
summary) via SMTP; `server/summary-report.js` generates PDF buffers server-side for those emails
(`createSummaryPdfBuffer`, `createAdminPdfBuffer`) using `jsPDF`. The client also has its own
client-side PDF generation path for immediate download at result time — keep both in sync if the
report layout changes. `docs/*.html` files are static preview snapshots of email/PDF output, not
source of truth.

**Styling:** Tailwind, config in `tailwind.config.js`. Custom color tokens (`pine`, `cream`, `gold`,
`coral`, `lavender`, `blue`, `muted`, plus legacy aliases `forest`/`copper`/`parchment`/`mist` that
map to the current palette) are defined there — use the token names, not raw hex, in new JSX.

## Terminology rule (site-wide, do not violate)

The product is called a **self-assessment** (ES: **autoevaluación**) in all user-visible text,
emails, and PDFs. The words "diagnostic" / "diagnosis" / "diagnóstico" must never appear in anything
a user reads. Internal variable/function names, the `/diagnostic` URL route, and code comments may
keep "diagnostic" — only user-facing strings must say "self-assessment". When grepping to verify this
(`grep -ri "diagnos" src/ server/`), the only expected hits are identifiers, the route path, and
comments.

## Bilingual copy rule

Every user-facing copy change must be made in **both** `en` and `es` blocks of
`src/data/assessment.js` (and any hardcoded strings in `src/App.jsx`). Spanish requires
gender-agreement changes, not blind find-replace: "diagnóstico" is masculine, "autoevaluación" is
feminine — articles/adjectives must follow (el→la, un→una, guardado→guardada, completo→completa).
