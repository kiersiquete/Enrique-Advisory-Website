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

