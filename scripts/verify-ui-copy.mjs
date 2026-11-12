import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { WEBSITE_COPY } from "../src/data/website.js";
import { COPY } from "../src/data/assessment.js";

const files = ["src/App.jsx", "src/data/assessment.js", "src/components/WebsitePages.jsx", "src/data/website.js"];
const bannedPatterns = [
  /download detailed pdf/i,
  /detailed pdf report/i,
  /reporte pdf detallado/i,
  /DetailedInputComparison/,
  /answer-by-answer table/i,
  /for the demo/i,
  /para el demo/i,
  /showDetailedReport/,
  /optionalReview/i,
  /view full review/i,
  /ver revisión completa/i
];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const pattern of bannedPatterns) {
    assert.equal(
      pattern.test(source),
      false,
      `${file} contains stale user-facing results/comparison copy: ${pattern}`
    );
  }
}

const appSource = readFileSync("src/App.jsx", "utf8");
const copySource = readFileSync("src/data/assessment.js", "utf8");
const storedResultSource = appSource.slice(
  appSource.indexOf("function browserStoredResult"),
  appSource.indexOf("function getInviteUrl")
);
assert.doesNotMatch(appSource, /fetch\(["']\/api\/invitations/, "invitations must use the visitor's email client");
assert.doesNotMatch(appSource, /view=admin-comparison|\/api\/comparison\?data=/, "advisor comparisons must not have a public browser route");
assert.match(appSource, /crypto\.getRandomValues/, "group and participant IDs must use Web Crypto");
assert.match(appSource, /expiresAt:\s*Date\.now\(\) \+ ttlMs/, "browser records must have an expiry");
assert.match(appSource, /browserStoredResult/, "completed browser results must be minimized");
assert.doesNotMatch(storedResultSource, /\b(profile|answers|groupId|participantId):/, "stored results must omit PII, answers, and bearer IDs");
assert.match(appSource, /ENABLE_MOCK_ROUTES\s*=\s*import\.meta\.env\.DEV/, "mock routes must be development-only");
assert.match(appSource, /en:\s*["']\/english["']/, "English must have a direct public route");
assert.match(appSource, /es:\s*["']\/spanish["']/, "Spanish must have a direct public route");
assert.match(appSource, /useState\(routeLanguageFromLocation\)/, "the initial language must come from the public route");
assert.match(copySource, /I understand and agree - begin/, "privacy acceptance must be explicit");
assert.match(copySource, /Open invitation email/, "invitation copy must describe the client-side mail action");

assert.deepEqual(Object.keys(WEBSITE_COPY.en).sort(), Object.keys(WEBSITE_COPY.es).sort(), "website translations must stay in sync");
for (const language of ["en", "es"]) {
  const website = WEBSITE_COPY[language];
  assert.equal(website.focusTitles.length, COPY[language].home.challengeItems.length);
  assert.equal(website.serviceTitles.length, COPY[language].services.items.length);
  assert.equal(website.servicePreviewTitles.length, website.serviceTitles.length);
  assert.equal(website.experience.length, 6);
  assert.equal(website.qualifications.length, 6);
  assert.equal(website.steps.length, 3);
  assert.equal(website.journey.length, 3);
  for (const value of Object.values(website)) assert.ok(value?.length, `empty ${language} website copy`);
  assert.notEqual(COPY[language].services.items[1].summary, COPY[language].services.items[3].summary, "1:1 advisory must not duplicate board services");
}
for (const asset of ["portrait-home", "portrait-about", "wordmark", "wordmark-white", "ffi", "imd", "denver", "icf", "ipec", ...Array.from({ length: 6 }, (_, i) => `focus-${i + 1}`), ...Array.from({ length: 4 }, (_, i) => `service-${i + 1}`)]) {
  assert.ok(existsSync(`public/brand/${asset}.webp`), `missing design asset: ${asset}`);
}
const websiteSource = readFileSync("src/components/WebsitePages.jsx", "utf8");
assert.ok(existsSync("public/brand/advisory-meeting-vlada-karpovich-7433856.jpg"), "missing licensed assessment photograph");
assert.match(websiteSource, /advisory-meeting-vlada-karpovich-7433856\.jpg/, "Home must use the selected real photograph");
assert.doesNotMatch(websiteSource, /family-governance-roundtable\.png/, "Home must not reference the replaced AI-generated image");
assert.doesNotMatch(websiteSource, /555.?123|123.?4567|Family Business.*Fellow/, "do not publish placeholder phone numbers or unconfirmed qualifications");
assert.match(websiteSource, /FULL_QUESTIONS\[language\]\.length/, "question count must come from the assessment data");
assert.match(websiteSource, /PILLARS\.length/, "topic count must come from the assessment data");
assert.match(websiteSource, /dialog\.showModal\(\)/, "the profile must use an accessible modal dialog");

console.log("UI copy verification passed.");
