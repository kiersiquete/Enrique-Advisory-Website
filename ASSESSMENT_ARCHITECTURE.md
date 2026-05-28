# Family Business Diagnostic Architecture

## Objective

Build a bilingual maturity diagnostic for Mexican enterprising families that behaves like a professional discovery tool, not a quiz or lead magnet. The full journey is:

Landing -> Profile intake -> Long diagnostic -> Result -> Invite comparison participants -> Group comparison -> Book a call.

The tool must also support a hidden short diagnostic URL, automated email flows, and a simple operational backlog for Gilbert.

## Current Project Baseline

- Frontend: React/Vite in `src/App.jsx`.
- Content: bilingual questions/copy in `src/data/assessment.js`.
- Scoring: `src/utils/results.js`.
- Backend: Express in `server/index.js`.
- Current persistence: append-only `storage/results.jsonl`.
- Current assessment state: local component state plus latest result in `localStorage`.

This means we can phase the work without introducing a heavy platform immediately, but group comparison and email automation require persistent identifiers and backend-owned records.

## Meeting Synthesis - May 25

Key takeaways from the Enrique/Gilbert follow-up:

- Gilbert is happy with the current direction, but the tool now needs to behave less like a standalone scorecard and more like a family discovery system.
- The highest business-value feature is shareability/group comparison. The core use case is multigenerational disagreement: a founder or senior generation may believe governance is healthy while the next generation may feel succession, communication, or long-term goals are unclear.
- The second priority is the new "I don't know / I have not been informed" answer. This is not a negative score. It is a signal that information may not be reaching some family members.
- The third priority is automated email follow-up: completion emails to the respondent and Gilbert, abandonment nudges, and group-comparison notifications when multiple generations complete the assessment.
- The short diagnostic should not be visible on the landing page or public assessment page.
- Gilbert asked for a simple backend/backlog rather than a complex CRM. Airtable is acceptable, but the implementation should remain flexible enough to advise on another tool if Airtable limits become a problem.
- Tools and accounts should ideally live under Gilbert's domain/account ownership, not the developer's personal accounts.
- There is pressure to show visible progress by Thursday/Friday, so the first demo should focus on tangible product logic and UI rather than final email/Airtable plumbing.

Product implication:

- Business priority is comparison first.
- Implementation should still begin with profile intake and unknown-answer scoring because comparison depends on respondent role/generation and accurate pillar scores.

## Core Concepts

### Respondent

A person taking either the full or short diagnostic.

Required fields:

- `id`
- `name`
- `email`
- `role`
- `roleOther`
- `generation`
- `country`
- `language`
- `createdAt`

### Assessment Session

A resumable diagnostic attempt.

Fields:

- `id`
- `respondentId`
- `groupId`
- `mode`: `full` or `short`
- `status`: `intake_started`, `in_progress`, `completed`, `booked`
- `answers`
- `currentQuestionIndex`
- `unknownCount`
- `unknownByPillar`
- `scorePerPillar`
- `overallScore`
- `stageId`
- `startedAt`
- `completedAt`
- `lastActivityAt`

### Group

A comparison container for 2 to 3 respondents.

Fields:

- `id`
- `inviteCode`
- `createdByRespondentId`
- `participantSessionIds`
- `maxParticipants`: `3`
- `createdAt`

### Invitation

An invitation from one respondent to another.

Fields:

- `id`
- `groupId`
- `inviterRespondentId`
- `inviteeEmail`
- `status`: `sent`, `opened`, `completed`
- `createdAt`
- `sentAt`
- `completedAt`

### Email Event

Operational log for automation state.

Fields:

- `id`
- `respondentId`
- `sessionId`
- `groupId`
- `flow`
- `step`
- `status`: `queued`, `sent`, `opened`, `failed`, `skipped`
- `sentAt`
- `openedAt`

## User Flow Architecture

### 1. Landing

The landing page keeps the full diagnostic CTA.

The short diagnostic must not appear in the landing navigation, cards, or visible links.

### 2. Profile Intake

Before questions, show a "Tell us about yourself" screen.

On submit:

- Validate required fields, especially email.
- Create or update a respondent.
- Create an assessment session.
- Persist enough state to recover the person later.
- Move to the questionnaire.

This is the trigger point for Flow A if the session is abandoned.

### 3. Questionnaire

The existing question flow remains, but answers support a new special value:

- Numeric responses: `0`, `1`, `2`, `3`, `4`, `5`
- Unknown response: `"unknown"`

Rules:

- `0` means "Not at all" and counts as zero.
- `"unknown"` is excluded from numeric average calculations.
- Unknowns are counted globally and per pillar.
- Progress should treat `"unknown"` as answered.

Visual treatment:

- Keep the 0 to 5 scale together.
- Add a separate lighter "I don't know" option below or beside the scale.
- Use a question mark icon and muted styling so it is not confused with a negative answer.

### 4. Scoring

Update scoring so each pillar calculates:

- `answered`: numeric answers only.
- `unknown`: unknown answers.
- `total`: all pillar questions.
- `score`: average of numeric answers normalized to 100.

If a pillar has no numeric answers, return `null` or a special insufficient-data state instead of silently scoring zero.

Overall score should average only pillars with numeric data. If too few pillars have numeric data, show an "insufficient information" result state.

Add transparency insight:

- If unknown count exceeds a configured threshold, show an additional result insight.
- Suggested v1 thresholds:
  - Full diagnostic: `unknownCount >= 6` or `unknownPercent >= 15%`.
  - Short diagnostic: `unknownCount >= 2`.

### 5. Result

The result screen should show:

- Overall score and maturity stage.
- Pillar scores.
- Lowest 3 opportunity areas.
- Transparency insight when the unknown threshold is reached.
- PDF download.
- Book a call CTA.
- Invite another family member CTA.

The result link should be stable:

- `/diagnostic/result/:sessionId`

The link must reveal only the viewer's own individual result.

### 6. Group Invitation

On result screen:

1. User clicks "Invite another family member to respond."
2. If no group exists, backend creates one.
3. User enters invitee email.
4. Backend creates invitation and sends email through email provider/webhook.
5. Invite link uses a code:
   - `/diagnostic?group=ABC123`

The invited respondent still completes their own profile intake before answering.

### 7. Comparison

Comparison screen appears when at least 2 completed sessions exist in a group.

Route:

- `/diagnostic/compare/:groupId`

Privacy rule:

- Show role/generation labels, not names.
- Show score per pillar, not question-level answers.
- Show unknown counts and important unknown mismatches.

Comparison sections:

- Side-by-side horizontal bars per pillar.
- Areas of convergence: pillar score gap under threshold.
- Areas of divergence: pillar score gap over 20 percentage points.
- Transparency gaps: one respondent knows/scores high while another says unknown.

For v1, cap groups at 3 completed respondents.

Decision:

- After any invited participant completes the assessment, automatically open the comparison if the group has at least 2 completed respondents.
- Keep the 3-person maximum for v1.

### 8. Hidden Short Diagnostic

Standalone route:

- `/diagnostic/short`

Rules:

- Not visible on landing.
- Can be linked from abandonment emails.
- Can be shared by Gilbert via WhatsApp or presentations.
- Uses the same intake, persistence, scoring, PDF, and result system as the full diagnostic.

Decision:

- The short diagnostic must be fully hidden from the public website for now.
- It remains a technical capability for later abandonment emails and direct WhatsApp/presentation sharing.

## Backend API Shape

Minimum v1 endpoints:

- `POST /api/respondents`
  - Creates or updates respondent profile by email.

- `POST /api/sessions`
  - Creates an assessment session.
  - Accepts `respondentId`, `mode`, optional `groupCode`.

- `PATCH /api/sessions/:sessionId`
  - Saves partial answers and progress.
  - Enables resume and abandonment detection.

- `POST /api/sessions/:sessionId/complete`
  - Calculates and stores final result.
  - Queues completed-assessment email flow.

- `GET /api/sessions/:sessionId`
  - Loads the respondent's own result or resume state.

- `POST /api/groups`
  - Creates group for a completed respondent if needed.

- `POST /api/groups/:groupId/invitations`
  - Creates invitation and triggers email.

- `GET /api/groups/:groupId/comparison`
  - Returns role-labeled comparison data only.

- `POST /api/bookings/mark-booked`
  - Marks session booked after the user clicks booking CTA or returns from scheduler.

- `POST /api/webhooks/email`
  - Receives provider events for sent/opened/clicked if supported.

## Persistence Strategy

### Phase 1

Use local JSON files or JSONL in `storage/` behind small repository functions:

- `respondents.jsonl`
- `sessions.jsonl`
- `groups.jsonl`
- `invitations.jsonl`
- `email-events.jsonl`

This matches the existing code and keeps implementation fast.

### Phase 1.5 / Production

Swap storage repository to one of:

- Airtable, easiest for Gilbert to inspect.
- Google Sheets API, simple but weaker as app data grows.
- Supabase/Postgres, best long-term if comparison links and email status become important.

Decision:

- Use Airtable for the production backlog once API credentials and base details are provided.
- Airtable integration is deferred for now; keep the backend storage simple until the credentials are available.

## Email Flow Architecture

Keep the app provider-agnostic by emitting events:

- `intake_started`
- `session_completed`
- `booking_clicked`
- `booking_confirmed`
- `group_invitation_created`
- `group_member_completed`

The backend should send these events to a single email adapter:

- `sendEmail(templateId, recipient, data)`
- `scheduleEmail(templateId, recipient, data, sendAt)`
- `cancelScheduledEmails(criteria)`

Suggested provider options:

- Resend for direct transactional email.
- Customer.io, Loops, MailerLite, or ActiveCampaign if marketing automation is preferred.
- Zapier/Make webhook bridge if the final platform is TBD.

Current decision:

- Email platform selection and implementation are deferred.
- The application should still be designed around clean events so the email platform can be added later without changing assessment logic.

### Flow A: Registration Without Completion

Trigger:

- Profile submitted, session not completed.

Steps:

- 24 hours: resume link.
- 72 hours: short diagnostic link if still incomplete.

### Flow B: Completed, Did Not Book

Trigger:

- Full or short diagnostic completed, no booking event.

Steps:

- 48 hours: top 3 opportunity areas, personalized question from lowest pillar, book CTA.
- 7 days: content relevant to weakest pillar, book CTA.

### Flow C: Completed And Booked

Trigger:

- Booking clicked or confirmed.

Steps:

- Immediate respondent confirmation with result summary.
- Email Gilbert with PDF, profile, result summary, role/generation/country, scheduled call date if available.

### Flow D: Group Invitation

Trigger:

- Invitation created.

Steps:

- Invitee receives invitation link.
- When invitee completes, both participants receive comparison link and group-call CTA.

## PDF Architecture

Current PDF generation is client-side with `jsPDF`.

For v1:

- Keep client-side download for the respondent.
- Add backend-side summary payload for Gilbert email.
- If provider needs an attachment, generate the PDF server-side later or send a secure result link first.

## Execution Plan

### Near-Term Demo Milestone

Goal:

- Show credible product progress without waiting for Airtable credentials or email-platform decisions.

Recommended demo scope:

- Public short diagnostic removed from visible UI.
- Profile intake screen before the long diagnostic.
- `I don't know` answer option with distinct visual styling.
- Scoring logic proving that `I don't know` is excluded from numeric averages and counted separately.
- Result screen transparency insight when unknown answers are present.
- First-pass comparison UI using stored/local sample group data if the full invitation backend is not ready yet.

Not in this milestone:

- Airtable production sync.
- Final email automations.
- Final consent/PDF policy.

### Phase 1: Intake and Unknown Answer

Files:

- `src/App.jsx`
- `src/data/assessment.js`
- `src/utils/results.js`
- `server/index.js`

Work:

- Add profile intake screen before `AssessmentFlow`.
- Add bilingual profile copy and field options.
- Store profile in result package.
- Add `"unknown"` answer option.
- Update answered/progress logic.
- Update scoring to exclude unknown values and count transparency gaps.
- Add result insight when threshold is met.
- Persist profile and unknown counts.

Verification:

- Can complete full diagnostic with a profile.
- Email is required.
- Unknown answer advances progress.
- Unknown does not lower numeric score.
- Result shows transparency insight above threshold.

### Phase 2: Stable Sessions and Resume

Work:

- Add session IDs.
- Save partial progress after intake and each answer.
- Load resume link from backend.
- Store result by session ID.

Verification:

- Refresh does not lose a session.
- Resume URL reopens the correct question or result.
- Backend has complete respondent/session records.

### Phase 3: Shareability and Group Comparison

Work:

- Add group creation and invitation endpoints.
- Add invite form on result screen.
- Add comparison route/screen.
- Implement 2 to 3 person cap.
- Compute convergence, divergence, and unknown mismatches.

Verification:

- Person A completes and invites Person B.
- Person B uses group link and completes intake/diagnostic.
- Comparison shows roles, not names.
- No question-level individual answers are exposed.

### Phase 4: Hidden Short Diagnostic

Work:

- Add route handling for `/diagnostic/short`.
- Remove short diagnostic from visible assessment selection if needed.
- Keep short diagnostic accessible by direct URL.

Verification:

- URL works directly.
- Landing navigation does not expose the short diagnostic.
- Short result and email events use same backend system.

### Phase 5: Email Event Integration

Work:

- Add email adapter layer.
- Add scheduled event records.
- Wire Flow A, B, C, and D.
- Add provider webhook receiver if provider supports opens/clicks.

Verification:

- Abandoned intake queues Flow A.
- Completed no-booking queues Flow B.
- Booking cancels Flow B and sends Flow C.
- Group invite sends Flow D.

### Phase 6: Backlog Dashboard

Work:

- Start with Airtable sync once credentials and base details are provided.
- Record completed assessment date, profile, scores, booking status, group status, email flow status.
- Add a simple internal endpoint/export if needed.

Verification:

- Gilbert can see completed respondents at a glance.
- Each record includes profile, scores, booking status, group status, and email flow status.

## Recommended Build Order

1. Profile intake and unknown scoring.
2. Backend session IDs and resume.
3. Group invitation and comparison.
4. Hidden short diagnostic route.
5. Email adapter and flows.
6. Production backlog integration.

## Deferred Questions

These items are intentionally parked until the next implementation pass or until credentials/content are provided:

1. Final email platform.
2. Exact unknown threshold for the transparency insight.
3. Whether respondent PDFs include profile details.
4. Consent copy for profile storage and follow-up emails.
5. Final Gilbert booking/scheduler link for the result CTA, booking modal, and PDF CTA.

Decided:

1. Production backlog will use Airtable later.
2. Comparison opens automatically after completion when at least 2 group results exist.
3. Short diagnostic stays hidden from the public website.
