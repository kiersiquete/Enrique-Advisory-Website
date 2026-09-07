import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = ["src/App.jsx", "src/data/assessment.js"];
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
assert.match(copySource, /I understand and agree - begin/, "privacy acceptance must be explicit");
assert.match(copySource, /Open invitation email/, "invitation copy must describe the client-side mail action");

console.log("UI copy verification passed.");
