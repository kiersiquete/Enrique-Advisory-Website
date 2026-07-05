import assert from "node:assert/strict";
import {
  buildComparisonReportPayload,
  buildSummaryReportPayload,
  createComparisonPdfBuffer,
  createSummaryPdfBuffer
} from "../server/summary-report.js";
import { htmlAdminEmail } from "../server/email.js";

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

function sampleAdminBody(language) {
  return {
    language,
    profile: { name: "Kier", email: "kier@example.com" },
    reportRequest: { contactRequested: true, status: "requested", recipientEmail: "kier@example.com" },
    result: {
      overall: 68,
      stage: { id: "established", level: { en: "Level 3", es: "Nivel 3" }, labels: { en: "Established", es: "Establecido" } },
      pillarScores: [{ id: "vision", score: 68 }],
      transparency: { unknownCount: 0 }
    }
  };
}

const adminHtmlEn = htmlAdminEmail(sampleAdminBody("en"), {});
const adminHtmlEs = htmlAdminEmail(sampleAdminBody("es"), {});
assert.match(adminHtmlEn, /wants to talk with you/);
assert.match(adminHtmlEs, /quiere hablar contigo/);
assert.match(adminHtmlEn, />Overall score</);
assert.match(adminHtmlEs, />Puntaje general</);

const comparisonGroup = {
  id: "GROUP123",
  participants: [
    {
      id: "p1",
      role: "founder",
      generation: "first",
      result: { overall: 70, transparency: { unknownCount: 0 }, pillarScores: [{ id: "vision", score: 70 }] }
    },
    {
      id: "p2",
      role: "family-working",
      generation: "second",
      result: { overall: 50, transparency: { unknownCount: 0 }, pillarScores: [{ id: "vision", score: 50 }] }
    }
  ]
};

const comparisonEs = buildComparisonReportPayload(comparisonGroup, "es");
assert.match(comparisonEs.participants[0].label, /Fundador/);
assert.match(comparisonEs.pillarRows[0].label, /Visión/);
const comparisonPdfEs = createComparisonPdfBuffer(comparisonEs);
assert.ok(comparisonPdfEs.length > 1000, "Spanish comparison PDF should render content");

console.log("Summary report i18n verification passed.");
