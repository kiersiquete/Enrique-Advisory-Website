import assert from "node:assert/strict";

import { FULL_QUESTIONS } from "../src/data/assessment.js";
import { resetRateLimitsForTests } from "../server/http-security.js";
import { PRIVACY_POLICY_VERSION } from "../server/validation.js";

process.env.AIRTABLE_API_TOKEN = "test-token";
process.env.AIRTABLE_BASE_ID = "appTestBase";
process.env.PUBLIC_SITE_URL = "https://gilbertdevlyn.com";
delete process.env.SMTP_HOST;
delete process.env.SMTP_PORT;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;
resetRateLimitsForTests();

const TABLES = {
  Respondents: [],
  "Assessment Sessions": [],
  "Comparison Groups": [],
  "Assessment Answers": []
};
let recordCounter = 0;

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    }
  };
}

function unescapeFormulaString(value) {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "\\" && index + 1 < value.length) index += 1;
    result += value[index];
  }
  return result;
}

function formulaMatches(record, formula) {
  const match = formula?.match(/^\{(.+)\} = '(.*)'$/s);
  if (!match) return true;
  return String(record.fields[match[1]] ?? "") === unescapeFormulaString(match[2]);
}

function airtableJson(data, ok = true) {
  return {
    ok,
    async text() {
      return JSON.stringify(data);
    }
  };
}

globalThis.fetch = async (url, options = {}) => {
  const parsed = new URL(url);
  const tableName = decodeURIComponent(parsed.pathname.split("/")[3] ?? "");
  const recordId = parsed.pathname.split("/")[4] ?? "";
  const records = TABLES[tableName];
  const method = options.method ?? "GET";
  assert.ok(records, `Unexpected Airtable table: ${tableName}`);

  if (method === "GET") {
    const formula = parsed.searchParams.get("filterByFormula");
    const maxRecords = Number(parsed.searchParams.get("maxRecords") || 100);
    return airtableJson({ records: records.filter((record) => formulaMatches(record, formula)).slice(0, maxRecords) });
  }
  if (method === "POST") {
    recordCounter += 1;
    const record = { id: `rec-${recordCounter}`, fields: JSON.parse(options.body).fields };
    records.push(record);
    return airtableJson(record);
  }
  if (method === "PATCH") {
    const record = records.find((item) => item.id === recordId);
    assert.ok(record);
    record.fields = { ...record.fields, ...JSON.parse(options.body).fields };
    return airtableJson(record);
  }
  return airtableJson({ error: { message: "Unexpected Airtable method" } }, false);
};

const resultsHandler = (await import("../api/results.js")).default;
const invitationsHandler = (await import("../api/invitations.js")).default;
const summaryPdfHandler = (await import("../api/summary-pdf.js")).default;
const advisorPdfHandler = (await import("../api/advisor-report-pdf.js")).default;
const scheduleCallHandler = (await import("../api/schedule-call.js")).default;
const comparisonHandler = (await import("../api/comparison.js")).default;
const groupStatusHandler = (await import("../api/group-status.js")).default;

const GROUP_ID = "a".repeat(32);
const COMPLETE_ANSWERS = Object.fromEntries(FULL_QUESTIONS.en.map((question) => [question.id, 4]));

function sampleBody({ participant = "1", name = "Serverless Test", email = "serverless@example.com" } = {}) {
  return {
    createdAt: "2026-09-07T01:00:00.000Z",
    finalizedAt: "2026-09-07T01:05:00.000Z",
    language: "en",
    mode: "full",
    profile: {
      name,
      email,
      phoneCountry: "mx",
      phoneCountryLabel: "MX",
      phoneDialCode: "+52",
      phoneNumber: "55 1234 5678",
      phoneDigits: "5512345678",
      phoneInternational: "+52 55 1234 5678",
      relationship: participant === "1" ? "founder" : "family-working",
      relationshipLabel: participant === "1" ? "Founder" : "Family member working in business",
      relationshipOther: "",
      generation: participant === "1" ? "first" : "second",
      generationLabel: participant === "1" ? "First generation" : "Second generation",
      country: "mx",
      countryLabel: "Mexico"
    },
    answers: COMPLETE_ANSWERS,
    groupId: GROUP_ID,
    participantId: participant.repeat(32),
    privacyConsent: {
      accepted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      acceptedAt: "2026-09-07T01:00:30.000Z"
    },
    reportRequest: {
      type: "summary",
      status: "requested",
      recipientEmail: email,
      language: "en",
      contactRequested: false,
      requestedAt: "2026-09-07T01:05:00.000Z"
    },
    result: { overall: 100 },
    groupParticipantCount: 99
  };
}

const validResponse = createResponse();
await resultsHandler({ method: "POST", headers: {}, body: sampleBody(), socket: { remoteAddress: "test-1" } }, validResponse);
assert.equal(validResponse.statusCode, 200);
assert.equal(validResponse.body.persistence, "airtable");
assert.equal(validResponse.body.result.overall, 80, "serverless scoring must ignore client result values");
assert.equal(validResponse.body.email.reason, "missing-smtp-config");
assert.equal(validResponse.body.group, undefined);
assert.equal(validResponse.body.sessionKey, undefined);
assert.doesNotMatch(JSON.stringify(validResponse.body), /serverless@example\.com|"answers"/);
assert.match(validResponse.headers["Cache-Control"], /no-store/);
assert.equal(validResponse.headers["X-Content-Type-Options"], "nosniff");

const duplicateResponse = createResponse();
await resultsHandler({ method: "POST", headers: {}, body: sampleBody(), socket: { remoteAddress: "test-1" } }, duplicateResponse);
assert.equal(duplicateResponse.statusCode, 200);
assert.equal(duplicateResponse.body.email.reason, "duplicate-submission");

const secondResponse = createResponse();
await resultsHandler(
  {
    method: "POST",
    headers: {},
    body: sampleBody({ participant: "2", name: "Second Person", email: "second@example.com" }),
    socket: { remoteAddress: "test-1" }
  },
  secondResponse
);
assert.equal(secondResponse.statusCode, 200);
assert.equal(secondResponse.body.groupStatus.participantCount, 2);
assert.equal(secondResponse.body.group, undefined, "advisor comparison data must remain inside the server");
assert.doesNotMatch(JSON.stringify(secondResponse.body), /second@example\.com|"answers"/);

const malformedResponse = createResponse();
await resultsHandler({ method: "POST", headers: {}, body: "{bad-json", socket: { remoteAddress: "test-2" } }, malformedResponse);
assert.equal(malformedResponse.statusCode, 400);
assert.equal(malformedResponse.body.error, "Request body must be valid JSON");

const crossOriginResponse = createResponse();
await groupStatusHandler(
  { method: "GET", headers: { origin: "https://attacker.invalid" }, query: { group: GROUP_ID } },
  crossOriginResponse
);
assert.equal(crossOriginResponse.statusCode, 403);

const trustedOriginResponse = createResponse();
await groupStatusHandler(
  { method: "GET", headers: { origin: "https://gilbertdevlyn.com" }, query: { group: GROUP_ID }, socket: { remoteAddress: "test-3" } },
  trustedOriginResponse
);
assert.equal(trustedOriginResponse.statusCode, 200);
assert.deepEqual(trustedOriginResponse.body, { ok: true, participantCount: 2, maxParticipants: 3 });
assert.match(trustedOriginResponse.headers["Cache-Control"], /no-store/);

const invalidGroupResponse = createResponse();
await groupStatusHandler(
  { method: "GET", headers: {}, query: { group: "SERVERLESSGROUP" }, socket: { remoteAddress: "test-4" } },
  invalidGroupResponse
);
assert.equal(invalidGroupResponse.statusCode, 400);

for (const [handler, expectedStatus] of [
  [invitationsHandler, 410],
  [summaryPdfHandler, 410],
  [scheduleCallHandler, 410],
  [advisorPdfHandler, 404],
  [comparisonHandler, 404]
]) {
  const response = createResponse();
  await handler({ method: "GET", headers: {}, query: { data: "forged" } }, response);
  assert.equal(response.statusCode, expectedStatus);
  assert.match(response.headers["Cache-Control"], /no-store/);
}

console.log("Serverless handler verification passed.");
