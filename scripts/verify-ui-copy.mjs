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

console.log("UI copy verification passed.");
