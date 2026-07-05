import assert from "node:assert/strict";
import { buildSummaryReportPayload, createSummaryPdfBuffer } from "../server/summary-report.js";

function sampleBody(language, stageId) {
  const stages = {
    foundational: { level: { en: "Level 1", es: "Nivel 1" }, labels: { en: "Foundational", es: "Fundacional" } },
    advanced: { level: { en: "Level 4", es: "Nivel 4" }, labels: { en: "Advanced", es: "Avanzado" } }
  };

  return {
    language,
    profile: { name: "Test Person" },
    result: {
      overall: stageId === "advanced" ? 82 : 10,
      stage: { id: stageId, ...stages[stageId] },
      pillarScores: [
        { id: "vision", score: 82 },
        { id: "ownership", score: 20 }
      ],
      transparency: { unknownCount: 0 }
    }
  };
}

const enPayload = buildSummaryReportPayload(sampleBody("en", "advanced"), {});
const esPayload = buildSummaryReportPayload(sampleBody("es", "advanced"), {});

assert.equal(enPayload.level, "Level 4 - Advanced");
assert.equal(esPayload.level, "Nivel 4 - Avanzado");
assert.equal(enPayload.pillarScores[0].label, "Family Vision, Values & Purpose");
assert.equal(esPayload.pillarScores[0].label, "Visión, Valores y Propósito Familiar");
assert.match(esPayload.interpretation, /reflexión/);
assert.match(esPayload.resultSummary, /familia/);

const foundationalEn = buildSummaryReportPayload(sampleBody("en", "foundational"), {});
const foundationalEs = buildSummaryReportPayload(sampleBody("es", "foundational"), {});
assert.equal(foundationalEn.level, "Level 1 - Foundational");
assert.equal(foundationalEs.level, "Nivel 1 - Fundacional");
assert.notEqual(foundationalEn.level, "foundational");
assert.notEqual(foundationalEs.level, "foundational");

const enPdf = createSummaryPdfBuffer(enPayload);
const esPdf = createSummaryPdfBuffer(esPayload);
assert.ok(enPdf.length > 1000, "English PDF should render content");
assert.ok(esPdf.length > 1000, "Spanish PDF should render content");

console.log("Summary report i18n verification passed.");
