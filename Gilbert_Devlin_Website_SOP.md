# SOP: Building the Gilbert Devlin Advisory Website

## 1. Purpose

This SOP explains how to build and maintain the Gilbert Devlin Advisory website step by step. The website is a premium advisory site for a family business advisor and board consultant. It includes:

- Home page
- About page
- Assessment page
- Full and short maturity assessments
- Results dashboard
- Follow-up message generator
- English and Spanish language support

The goal is to create a calm, trustworthy, reflective website that feels like a family business advisory experience, not a startup or SaaS product.

## 2. Project Stack

Use this stack:

- React for the frontend
- Vite for local development and build
- Tailwind CSS for layout and styling
- Recharts for the radar chart
- Lucide React for icons
- jsPDF for PDF summary download
- Express for optional local API endpoints

Main commands:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Local development URL:

```bash
http://localhost:5173
```

## 3. Project File Structure

Important files:

```text
index.html
package.json
tailwind.config.js
src/main.jsx
src/App.jsx
src/index.css
src/data/assessment.js
src/utils/results.js
src/utils/messageGenerator.js
server/index.js
public/family-governance-roundtable.png
public/favicon.svg
```

What each file does:

- `src/App.jsx`: Main website UI, navigation, page sections, assessment flow, results dashboard, PDF download.
- `src/data/assessment.js`: All bilingual content, pillars, questions, maturity levels, CTAs, stage descriptions.
- `src/utils/results.js`: Scoring and maturity stage calculation.
- `src/utils/messageGenerator.js`: Follow-up message generation logic.
- `tailwind.config.js`: Brand colors, fonts, shadows, and design tokens.
- `index.html`: Page metadata and Google Fonts.
- `server/index.js`: Optional local backend for storing results and generating follow-up messages.

## 4. Design System Setup

Use the Gilbert Devlin brand tokens consistently:

```text
Primary green: #1C3D2E
Secondary green: #244A39
Accent terracotta: #C4713A
Background linen: #F0EDE4
Body text: #2A2A2A
Muted text: #6B6B5F
Card white: #FFFFFF
```

Typography:

- Headings: `Cormorant Garamond`
- Body: `DM Sans`

In `index.html`, load Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

In `tailwind.config.js`, define colors, shadows, and fonts under `theme.extend`.

## 5. Build the Global Layout

### Step 1: Create the app state

In `src/App.jsx`, manage page state with React:

```js
const [language, setLanguage] = useState("en");
const [screen, setScreen] = useState("home");
const [activeMode, setActiveMode] = useState(null);
const [latestResult, setLatestResult] = useState(loadLatestResult);
```

Screens used:

```text
home
about
assessment-home
assessment
loading
results
followup
```

### Step 2: Create navigation helper

Use a single function to move between pages:

```js
function navigate(screenName) {
  setActiveMode(null);
  setCopied(false);
  setScreen(screenName);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
```

### Step 3: Build the sticky header

The navbar should follow this structure:

```text
[Logo + Gilbert Devlin]     [Home   About   Assessment]     [EN | ES]
```

Implementation rules:

- Logo and brand name stay on the left.
- Primary navigation is centered on desktop.
- Language toggle stays on the far right.
- Header is sticky.
- Add subtle border and shadow when scrolled.
- Header must remain keyboard navigable.

### Step 4: Build the footer

Footer content:

- Left: Gilbert Devlin logo and tagline
- Center: Home, About, Assessment links
- Right: EN/ES toggle and `hello@gilbertdevlin.com`
- Bottom: copyright line

Add explicit landmark role:

```jsx
<footer role="contentinfo">
```

## 6. Build the Home Page

The Home page has four sections plus footer.

### Section 1: Hero

Use a split layout:

- Left column: headline, copy, CTAs, disclaimer.
- Right column: family business meeting image.
- Floating card over image: maturity stage preview, score 68, progress bars.

Required hero copy:

```text
Guided governance reflection for family businesses
```

CTA buttons:

- `Start assessment`
- `Learn about Gilbert`

Disclaimer:

```text
The tool is a starting point for reflection, not a judgment of the family or the business.
```

### Section 2: Three-column info cards

Create three cards:

1. Who is Gilbert?
2. What the advisory work does
3. Who this helps

Use icons from `lucide-react`, rounded cards, warm background, and subtle hover lift.

### Section 3: Approach

Create a richer visual section:

```text
How Gilbert works with families
Every engagement starts with a structured reflection - not advice, but better questions.
```

Three feature blocks:

1. Structure before solutions
2. Neutral facilitation
3. Governance that fits the family

### Section 4: Assessment CTA banner

Use a full-width dark green band:

```text
Start your reflection today
```

CTA:

```text
Take the assessment
```

Use terracotta for the button.

## 7. Build the About Page

The About page has four sections plus footer.

### Section 1: Personal background

Two-column layout:

- Left: professional advisor photo or placeholder image.
- Right: ABOUT GILBERT label, headline, bio paragraphs, CTA.

Headline:

```text
Helping families have the conversations that shape what comes next
```

CTA:

```text
Take the Family Business Maturity Assessment
```

### Section 2: Credentials and experience

Create a metrics row:

```text
20+ Years advising family businesses
80+ Family engagements completed
4 Board seats held in family companies
6 Countries worked in
```

Below the metrics, create two columns:

- Education & Certifications
- Areas of Focus

### Section 3: Testimonials

Create three testimonial cards with:

- Large serif quote text
- Author name
- Role/context line

Keep the testimonials warm, credible, and advisory-oriented.

### Section 4: Why Gilbert built this tool

Use this section as a bridge to the assessment.

Explain:

- Families often do not know where to start.
- The tool is not a scorecard.
- It gives a shared map across eight governance pillars.
- It is available in English and Spanish.

CTA:

```text
Start the assessment
```

## 8. Build the Assessment Landing Page

The assessment landing page is a two-column layout.

### Left column

Dark green intro panel with:

- Label: ASSESSMENT
- Headline: Choose your reflection path
- Body text
- Disclaimer card
- Language note: Available in EN and ES

### Right column

Three rich option cards:

1. Full Assessment
   - 50 questions
   - Approximately 10 minutes
   - Radar chart and full result

2. Short Assessment
   - 8 questions
   - Approximately 2 minutes
   - Summary result and maturity stage

3. Follow-up Message
   - Select a stage
   - Generate message in seconds
   - Ready to send

Each card should:

- Use a circular dark green icon.
- Include title, subtitle, meta line, and arrow.
- Lift slightly on hover.
- Use a green border highlight on hover.

## 9. Build Assessment Data

All data lives in:

```text
src/data/assessment.js
```

Define:

- `LANGUAGES`
- `PILLARS`
- `FULL_QUESTIONS`
- `SHORT_QUESTIONS`
- `STAGES`
- `SUPPORT_MESSAGE`
- `COPY`

The eight pillars are:

1. Family Vision, Values & Purpose
2. Family Constitution / Protocol
3. Family Governance Bodies
4. Ownership Governance
5. Business Governance (Board)
6. Management & Professionalization
7. Next Generation Development
8. Family Harmony, Conflict & Legacy

The full assessment currently contains 50 questions.

Confirm question count with:

```bash
node -e "import('./src/data/assessment.js').then(m => console.log(m.FULL_QUESTIONS.en.length, m.FULL_QUESTIONS.es.length))"
```

Expected output:

```text
50 50
```

## 10. Build the Question Flow

The question flow lives in `AssessmentFlow` inside `src/App.jsx`.

Requirements:

- Top progress bar
- Pillar label
- Question count
- Centered card
- Large serif question text
- 0 to 5 scale buttons
- Previous and Next buttons
- Brief transition screen between pillars

Scale labels:

```text
0 = Not at all
1 = Very limited
2 = Early signs
3 = Partially
4 = Mostly in place
5 = Fully in place
```

When the user selects a score:

```js
setAnswers((current) => ({ ...current, [question.id]: score }));
```

When all questions are answered:

```js
onComplete(answers);
```

## 11. Build Scoring Logic

Scoring lives in:

```text
src/utils/results.js
```

Per pillar:

```js
(average / 5) * 100
```

Overall score:

```js
Average of all eight pillar scores
```

Maturity stages:

```text
0-25: Level 1 - Foundational
26-50: Level 2 - Emerging
51-75: Level 3 - Established
76-100: Level 4 - Advanced
```

## 12. Build the Results Dashboard

The results dashboard lives in `ResultsScreen`.

Include:

- Overall score, formatted as `Score / 100`
- Maturity stage label
- Stage description
- Radar chart
- Pillar breakdown rows
- Color-coded bars
- What the family can do
- Consultant support message
- CTAs

Bar color rules:

```text
Score under 40: red
Score 40-64: terracotta
Score 65 and above: green
```

Use Recharts:

```jsx
<ResponsiveContainer>
  <RadarChart>
    <Radar />
  </RadarChart>
</ResponsiveContainer>
```

## 13. Build the PDF Download

PDF export lives in:

```text
downloadPdfSummary()
```

Use `jsPDF` to export:

- App name
- Overall score
- Maturity stage
- Stage description
- Reflection
- Pillar scores
- What the family can do
- Consultant support message

Button label:

```text
Download PDF summary
```

## 14. Build the Follow-up Message Generator

The follow-up message generator lives in:

```text
FollowUpGenerator
src/utils/messageGenerator.js
```

Inputs:

- Maturity stage
- Optional family or business name
- Format: WhatsApp or email

Output:

- Stage label
- Reflection paragraph
- Three action bullets
- Consultant support paragraph

Keep the tone:

- Warm
- Reflective
- Neutral
- Non-salesy

## 15. Bilingual Support

All visible text should be stored in `COPY.en` and `COPY.es`.

Rules:

- Do not hardcode page copy inside components unless it is purely structural.
- Add every new label, CTA, section title, and paragraph in both languages.
- Keep language toggle available in header and footer.
- Update `document.documentElement.lang` when language changes.

## 16. Accessibility Requirements

Checklist:

- Body text is at least 16px.
- Buttons are keyboard navigable.
- Focus states are visible.
- Header nav uses `aria-current="page"` for active page.
- Footer uses `role="contentinfo"`.
- Images that are decorative use empty `alt=""`.
- Meaningful images have descriptive alt text.
- Buttons have readable labels.
- Do not rely on color alone for assessment results.

## 17. Responsive Requirements

Test these viewports:

```text
Desktop: 1440 x 950
Tablet: 768 x 1024
Mobile: 390 x 844
```

Responsive behavior:

- Header stacks neatly on smaller screens.
- No horizontal overflow.
- Hero image moves below copy on mobile/tablet.
- CTA buttons become full-width on mobile.
- Assessment scale wraps cleanly on mobile.
- Radar chart remains visible and readable.
- Footer stacks on mobile.

## 18. Quality Assurance Steps

### Step 1: Build check

```bash
npm run build
```

Expected result:

```text
✓ built
```

Large bundle warnings from Vite can appear because of charting and PDF libraries. They are warnings, not build failures.

### Step 2: Local run

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

### Step 3: Manual UI checks

Check:

- Home loads with hero, image, floating maturity card, approach section, CTA banner, footer.
- About loads with bio, metrics, credentials, testimonials, tool bridge, footer.
- Assessment landing shows all three mode cards.
- Full Assessment starts with Question 1 of 50.
- Short Assessment completes and shows a results dashboard.
- Language toggle changes labels and copy.
- PDF download button appears after full results.
- No pressure language appears in CTAs.

### Step 4: Browser console check

Verify:

- No console errors.
- No console warnings related to app behavior.

### Step 5: Overflow check

In browser dev tools or Playwright, confirm:

```js
Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
```

Expected result:

```text
0
```

## 19. Content and Tone Rules

Always use:

- Reflective language
- Human language
- Warm language
- Neutral language
- Non-technical explanations

Avoid:

- Sales pressure
- Urgency
- Alarmist language
- Audit/test/ranking framing
- Comparisons with other families
- "Buy", "Hire now", "Urgent"

The assessment should feel like a guided reflection, not a judgment.

## 20. Maintenance Workflow

When making future updates:

1. Edit copy first in `src/data/assessment.js`.
2. Update components in `src/App.jsx`.
3. Keep design tokens in `tailwind.config.js`.
4. Keep scoring logic in `src/utils/results.js`.
5. Run `npm run build`.
6. Test desktop, tablet, and mobile.
7. Check Home, About, Assessment, Results, and Follow-up flows.
8. Confirm no horizontal overflow.
9. Keep any new visible text bilingual.

## 21. Common Change Requests

### Add a new question

1. Open `src/data/assessment.js`.
2. Add the English question to the correct pillar in `fullEn`.
3. Add the Spanish version to the same pillar in `fullEs`.
4. Run the question count command.
5. Run `npm run build`.

### Update a CTA

1. Open `src/data/assessment.js`.
2. Find the CTA in `COPY.en`.
3. Update the Spanish version in `COPY.es`.
4. Run `npm run build`.

### Change brand colors

1. Open `tailwind.config.js`.
2. Update the token values.
3. Check all pages for contrast and visual consistency.
4. Run `npm run build`.

### Replace the hero image

1. Add the new image to `public/`.
2. Update image `src` paths in `src/App.jsx`.
3. Verify cropping on desktop, tablet, and mobile.

## 22. Final Handoff Checklist

Before handing off the website, confirm:

- The site opens at `http://localhost:5173`.
- `npm run build` passes.
- Header nav is centered on desktop.
- Footer is visible and complete.
- Home has 4 sections plus footer.
- About has 4 sections plus footer.
- Assessment landing is rich and professional.
- Full assessment has 50 questions.
- Short assessment has 8 questions.
- Results dashboard includes radar chart and pillar breakdown.
- PDF download works after full assessment.
- Follow-up generator works.
- English and Spanish content are available.
- Desktop, tablet, and mobile layouts have no horizontal overflow.

## 23. Project Task List - Updated July 1, 2026

Use this section as the single source of truth for project work. Add any new task here first so future changes stay tracked carefully.

Latest source: Fathom meeting on July 1, 2026. Main direction: finish the site within a two-week window with precise, human-reviewed execution; simplify the self-assessment funnel; make comparison reports internal-only for Gilbert; and polish the consulting-site flow, copy, visuals, and brand system.

Prior source: Enrique review meeting on June 29, 2026. Main direction: make the site feel like a robust consulting website for a technical, niche family-enterprise advisor. The assessment should become a secondary lead-generation tool, not the center of the whole site.

Additional source: Gilbert Rev3 written checklist and identity exploration image shared July 1, 2026. Main direction: make the self-assessment feel more like the first step in a confidential advisory process, strengthen privacy/consent language, improve visibility of results, clarify follow-up/sharing flows, and apply the new brand palette.

- [x] Advisor-first homepage positioning.
  - Home now explains who Gilbert is, what family-business problem he helps solve, and why the work matters before introducing the diagnostic.
  - The diagnostic is framed as a starting point for advisory work, not the whole service.

- [x] Services page and Home services preview.
  - Added the Services navigation item in English and Spanish.
  - Added the Services page for consulting projects, board service, executive coaching, and 1:1 advisory.
  - Added the Home "How I Help" preview linking into Services.

- [x] Stronger About page.
  - Expanded the About page beyond personal history.
  - Added more context around family-business challenges, lived experience, trust, discretion, and strategic advisory value.

- [x] Invitation and comparison QA.
  - Verified the invitation and comparison flow work locally for the current implementation.
  - Confirmed the comparison experience supports private group links and participant count updates.
  - Current invite direction is direct email invitation instead of copy-link sharing.
  - Group logic is intended to lock at 3 participants.
  - Airtable duplicate-entry issue was confirmed as fixed during the meeting demo.

- [x] Email/report polish.
  - Polished the summary request and invitation email language.
  - Clarified that individual answers are not shared question by question.

- [x] Public privacy and contact cleanup.
  - Removed visitor-facing draft placeholders from the Privacy Policy.
  - Changed public contact references to `info@gilbertdevlyn.com`.
  - Kept entity/address language conservative until Gilbert confirms final business details.

- [ ] July 1 mandate: simplify, de-duplicate, and finish.
  - Remove redundant content and illogical flows that came from rapid iteration.
  - Use precise, human-reviewed copy and interaction decisions before building.
  - Keep the work focused on the two-week finish window and final client expectations.

- [x] July 1 coordination follow-ups.
  - Send the next meeting invite for Monday at the same time.
  - Get Enrique's final palette hex codes if the sampled image colors are not official.
  - Get Enrique's final logo file when ready.

- [ ] Gilbert Rev3: About CTA and advisory-process framing.
  - Change the assessment CTA in About to feel more like "let's work together" instead of a hard push into the assessment.
  - Explain in more detail that the first step is a diagnostic/self-assessment, how it works, what the process looks like, and what the family will receive.
  - Add much more detail about confidentiality, sensitive information handling, and the boundaries of the safe space.
  - Add a clearer privacy heads-up before starting the self-assessment.
  - Replace or reframe "for sensitive rooms" language around privacy/confidentiality.
  - Add an in-questionnaire reminder that the self-assessment is a safe and confidential space.

- [ ] Gilbert Rev3: Results, scoring, and report clarity.
  - Enlarge the radar/spider results diagram for better visibility.
  - Define and clearly explain how "I don't know" answers affect the final score.
  - Review whether answers scored as 0 are correctly weighted in the result. If a dimension has several 0 answers and one 5 answer, the dimension should reflect the zeros instead of appearing as 5.
  - Add "starting point" language to the diagnostic result so it is clear the output is not a defined plan.
  - When the diagnostic is completed in Spanish, make sure the report/email arrives in Spanish.

- [ ] Gilbert Rev3: Follow-up, consent, and email CTAs.
  - Simplify the post-assessment action area to one primary "Save and email me my report" button.
  - Do not ask the user to enter their email again because it was already collected at the start.
  - Add an optional checkbox: "I would like Gilbert to contact me to discuss the results."
  - If the checkbox is selected, trigger an email to Gilbert; if not selected, save/send the report without contact.
  - In the individual results email, add three buttons: Download PDF, Schedule a Conversation with Gilbert, and Invite Someone.
  - Make sure the results email also reaches `info@gilbertdevlyn.com` in Gilbert's Outlook, not only Hostinger.

- [ ] Gilbert Rev3: Sharing and comparison experience.
  - Add more visual explanation of why sharing the result with someone else is valuable.
  - Explain that the value comes from comparing perspectives, not from judging one person.
  - Replace the complex results-page invite section with a cleaner Invite Someone path from the results email.
  - Create a dedicated invite page that explains the value of comparison, shows a visual example such as overlapping graphs, and includes the email input.
  - Include a field where the user can enter the email address of the person they would like to invite.
  - Make the invitation to participate in the self-assessment shareable and branded.

- [ ] Gilbert Rev3: Data capture and operations.
  - Create or connect a simple database where all completed self-assessments are registered.
  - At minimum, track user login/contact details such as name and email.
  - Confirm whether Google Sheets, Airtable, or both should be the operating source of truth.

- [ ] Gilbert Rev3: Terminology consistency.
  - Audit the site, assessment, emails, reports, and PDFs for consistent terminology.
  - Use "self-assessment" consistently where Gilbert wants that term.
  - Avoid mixed use of "diagnostic", "assessment", "assesment", and "diagnóstico" unless the bilingual copy intentionally requires it.

- [ ] Gilbert Rev3: Board services copy.
  - In the board services section, make the copy speak more directly to early-stage family enterprises.
  - Position the service as help structuring a governance system, creating or professionalizing a board, and professionalizing the Consejo de Administración.

- [ ] Video production and placement.
  - Film one interview or Q&A with Gilbert.
  - Edit a short Home page video introducing Gilbert and the advisory work.
  - Edit a longer About page video explaining Gilbert's background, lived experience, and way of working.
  - Place the Home video early in the Home page flow once available.
  - Replace the current video placeholder/embed URLs with the final video embeds.

- [ ] Fix comparison-view return/access bug.
  - Meeting bug: after the first post-completion redirect, users may not be able to return to the comparison view later.
  - Likely root cause discussed in the meeting: caching or saved-state behavior.
  - If the comparison view becomes internal-only, Gilbert/admin should still be able to return to the comparison after the group result is ready.

- [x] Home page consulting-site overhaul.
  - Rework the site so Gilbert is clearly positioned as a strong technical consultant in a niche family-enterprise advisory space.
  - Remove redundant sections such as repeated "why advisory matters" and "how Gilbert works" content.
  - Reorganize Home into the July 1 meeting flow: video, problem Gilbert solves, why advisory matters, consequences of ignoring the family dimension, and how Gilbert works.
  - Go deeper on the specific problems he solves before asking visitors to take the self-assessment.
  - Keep the self-assessment visible, but secondary to Gilbert's advisory positioning and services.

- [ ] Services page problem-first expansion.
  - Start the Services page with a deeper explanation of the core family-enterprise problems Gilbert helps solve.
  - Present consulting projects, board service, executive coaching, and 1:1 advisory as solutions after the problem context.
  - Add more detail on who each service is for, what Gilbert helps with, and what outcome the family should expect.

- [ ] About page credentials cleanup.
  - Keep About focused on Gilbert's credentials, experience, credibility, and lived perspective.
  - Remove or reduce the large assessment CTA from About so the page does not over-push the diagnostic.
  - Move deeper family-enterprise problem framing to Services or Home instead of forcing it into About.

- [ ] Self-assessment intro, privacy, and safe-space framing.
  - Add a clear first-page explanation of what the self-assessment is, why it exists, and how it supports the advisory process.
  - Make clear that the self-assessment is a starting point, not a defined action plan.
  - In the green box on the first page, replace "Built for sensitive rooms" with safe-space wording.
  - Explain that information is handled privately and confidentially.
  - Before the self-assessment begins, include a clear privacy notice or pop-up explaining how sensitive information will be handled.
  - Keep the self-assessment visible, but secondary to Gilbert's advisory positioning and services.

- [ ] UI/UX redesign for readability and polish.
  - Reduce dense, cramped boxes, especially on the Home page.
  - Use more white space, long-scroll sections, minimalistic diagrams, frameworks, icons, and professional images.
  - Make the information feel beautiful, polished, and easy to read for the two-week finish window.

- [ ] Design system refresh.
  - Apply the identity exploration palette from the shared image: pine `#0E3B36`, cream `#F4EEE2`, lavender `#C9B2DE`, blue `#B9CEE3`, white `#FFFFFF`, gold `#F1C84C`, and coral `#EE5A3C`.
  - Treat these sampled colors as working values until Enrique confirms official hex codes.
  - Replace the current mustard/brown direction where it feels too heavy.
  - Refresh typography, background tone, button colors, and visual hierarchy so the site feels more professional.
  - Add the final logo when Enrique provides it.

- [ ] Schedule conversation CTA flow.
  - Add a direct "Schedule a Conversation with Gilbert" path for visitors who are ready to talk.
  - Do not use iCal for this version.
  - Trigger an email to Gilbert and redirect the user to a confirmation page saying: "Gilbert has been notified that you would like to speak with him."

- [ ] Re-scope comparison reporting as internal-only.
  - The comparative results report should only be sent to Gilbert.
  - Users should receive individual reports only.
  - Gilbert should receive or access the comparative report internally.
  - Do not send complex comparison data to participants unless Gilbert/Enrique explicitly approve that later.
  - Confirm how Gilbert is notified when enough participants complete a group for internal comparison.

- [ ] Confirm production email settings.
  - Make sure production email environment variables send public contact and system notifications to the intended inbox.
  - Confirm the exact final email/domain spelling because current site copy uses `info@gilbertdevlyn.com`, the July 1 Fathom summary mentions `info@gilbertdevlin.com`, and the Gilbert Rev3 checklist mentions `info@gilbertdevly.com`.
  - Research forwarding options from the older host/domain setup to Gilbert's current inbox, including whether Gmail "Send mail as" or forwarding can solve it.
  - Keep the confirmed `info@...` address as the public-facing address unless Gilbert asks for another one.

- [ ] Confirm legacy architecture backlog items.
  - Decide whether abandoned-intake and completed-but-not-booked email flows are still needed.
  - Confirm whether the current SMTP/Hostinger setup is the final email platform or only a temporary provider.
  - Confirm the exact unknown-answer threshold for the transparency insight.
  - Confirm whether respondent PDFs should include profile details.
  - Confirm whether legacy booking-click/booking-confirmed events still need backend tracking now that the July 1 direction is email-triggered scheduling.
  - Confirm whether an internal endpoint/export is still needed in addition to Airtable or Google Sheets.

- [ ] Short diagnostic decision.
  - Current docs mention a hidden short diagnostic route, but the public app currently focuses on the full diagnostic.
  - Confirm whether the short diagnostic is still needed, or remove it from handoff expectations.

- [ ] Production/legal review.
  - Gilbert or Enrique should review Home, Services, About, Diagnostic, emails, reports, and Privacy Policy before launch.
  - Confirm final legal entity, business address wording, data retention expectations, and jurisdiction-specific privacy requirements.
