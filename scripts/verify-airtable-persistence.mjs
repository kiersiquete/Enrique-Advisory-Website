import assert from "node:assert/strict";

import { FULL_QUESTIONS } from "../src/data/assessment.js";
import { PRIVACY_POLICY_VERSION } from "../server/validation.js";

const TABLES = {
  Respondents: [],
  "Assessment Sessions": [],
  "Comparison Groups": [],
  "Assessment Answers": []
};

let recordCounter = 0;
let deleteRequests = 0;

process.env.AIRTABLE_API_TOKEN = "test-token";
process.env.AIRTABLE_BASE_ID = "appTestBase";

function nextRecordId() {
  recordCounter += 1;
  return `rec${String(recordCounter).padStart(4, "0")}`;
}

function tableNameFromUrl(url) {
  return decodeURIComponent(new URL(url).pathname.split("/")[3]);
}

function recordIdFromUrl(url) {
  return new URL(url).pathname.split("/")[4] || "";
}

function unescapeFormulaString(value) {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "\\" && index + 1 < value.length) index += 1;
    result += value[index];
  }
  return result;
}

function matchFormula(record, formula) {
  const match = formula?.match(/^\{(.+)\} = '(.*)'$/s);
  if (!match) return true;
  const [, field, escapedValue] = match;
  return String(record.fields[field] ?? "") === unescapeFormulaString(escapedValue);
}

function jsonResponse(data, ok = true, status = 200) {
  return {
    ok,
    status,
    async text() {
      return JSON.stringify(data);
    }
  };
}

globalThis.fetch = async (url, options = {}) => {
  const method = options.method ?? "GET";
  const tableName = tableNameFromUrl(url);
  const records = TABLES[tableName];
  assert.ok(records, `Unknown Airtable table requested: ${tableName}`);

  if (method === "GET") {
    const params = new URL(url).searchParams;
    const formula = params.get("filterByFormula");
    const maxRecords = Number(params.get("maxRecords") ?? 100);
    return jsonResponse({ records: records.filter((record) => matchFormula(record, formula)).slice(0, maxRecords) });
  }

  if (method === "POST") {
    const record = { id: nextRecordId(), fields: JSON.parse(options.body).fields };
    records.push(record);
    return jsonResponse(record);
  }

  if (method === "PATCH") {
    const record = records.find((item) => item.id === recordIdFromUrl(url));
    assert.ok(record, `Record not found for PATCH: ${recordIdFromUrl(url)}`);
    record.fields = { ...record.fields, ...JSON.parse(options.body).fields };
    return jsonResponse(record);
  }

  if (method === "DELETE") {
    deleteRequests += 1;
    return jsonResponse({ records: [] });
  }

  return jsonResponse({ error: "Unsupported method" }, false, 405);
};

const {
  escapeFormulaValue,
  getComparisonGroupFromAirtable,
  persistAssessmentToAirtable
} = await import("../server/airtable.js");

const GROUP_ID = "a".repeat(32);
const SECOND_GROUP_ID = "b".repeat(32);
const COMPLETE_ANSWERS = Object.fromEntries(FULL_QUESTIONS.en.map((question) => [question.id, 3]));

function sampleBody(overrides = {}) {
  const profile = {
    name: "Kier Test",
    email: "kier@example.com",
    phoneCountry: "mx",
    phoneCountryLabel: "MX",
    phoneDialCode: "+52",
    phoneNumber: "55 1234 5678",
    phoneDigits: "5512345678",
    phoneInternational: "+52 55 1234 5678",
    relationship: "founder",
    relationshipLabel: "Founder",
    relationshipOther: "",
    generation: "first",
    generationLabel: "First generation",
    country: "mx",
    countryLabel: "Mexico",
    ...(overrides.profile ?? {})
  };
  const topLevelOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([key]) => !["profile", "answers", "privacyConsent", "reportRequest"].includes(key))
  );

  return {
    createdAt: "2026-09-07T01:00:00.000Z",
    finalizedAt: "2026-09-07T01:05:00.000Z",
    language: "en",
    mode: "full",
    profile,
    answers: overrides.answers ?? COMPLETE_ANSWERS,
    groupId: overrides.groupId ?? GROUP_ID,
    participantId: overrides.participantId ?? "1".repeat(32),
    privacyConsent: {
      accepted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      acceptedAt: "2026-09-07T01:00:30.000Z",
      ...(overrides.privacyConsent ?? {})
    },
    reportRequest: {
      type: "summary",
      status: "requested",
      recipientEmail: profile.email,
      language: "en",
      contactRequested: false,
      requestedAt: "2026-09-07T01:05:00.000Z",
      ...(overrides.reportRequest ?? {})
    },
    result: { overall: 100 },
    groupParticipantCount: 99,
    inviteLink: "https://attacker.invalid",
    ...topLevelOverrides
  };
}

function tableCounts() {
  return Object.fromEntries(Object.entries(TABLES).map(([name, records]) => [name, records.length]));
}

assert.equal(escapeFormulaValue("a\\b'c"), "a\\\\b\\'c", "formula strings must escape backslashes before quotes");

const firstSave = await persistAssessmentToAirtable(sampleBody());
assert.equal(firstSave.ok, true);
assert.equal(firstSave.isNewSubmission, true);
assert.equal(firstSave.group, undefined, "persistence results must not expose advisor comparison data");
assert.equal(firstSave.sessionKey, undefined, "opaque Airtable keys must remain server-side");
assert.equal(firstSave.groupStatus.participantCount, 1);
assert.equal(TABLES.Respondents.length, 1);
assert.equal(TABLES["Assessment Sessions"].length, 1);
assert.equal(TABLES["Assessment Answers"].length, 1);
assert.equal(TABLES["Comparison Groups"].length, 1);

const rawResult = JSON.parse(TABLES["Assessment Sessions"][0].fields["Raw Result JSON"]);
assert.equal(rawResult.result.overall, 60, "Airtable must retain the server-calculated result");
assert.equal(rawResult.groupParticipantCount, undefined, "client counts must not be retained");
assert.equal(rawResult.inviteLink, undefined, "client-provided links must not be retained");
assert.equal(rawResult.reportRequest.advisorDetail, undefined, "unbounded client advisor data must be discarded");
assert.equal(rawResult.privacyConsent.policyVersion, PRIVACY_POLICY_VERSION);
assert.equal(rawResult.privacyConsent.acceptedAt, "2026-09-07T01:00:30.000Z");
assert.equal(TABLES.Respondents[0].fields.Notes, `Assessment key: assessment-${"1".repeat(32)}`);
assert.equal(TABLES["Comparison Groups"][0].fields["Invite Link"], "");

TABLES.Respondents.push({ id: "rec-duplicate", fields: { ...TABLES.Respondents[0].fields } });
const countsWithDuplicate = tableCounts();
const retry = await persistAssessmentToAirtable(sampleBody({
  privacyConsent: { acceptedAt: "2026-09-07T01:00:45.000Z" }
}));
assert.equal(retry.isNewSubmission, false);
assert.deepEqual(tableCounts(), countsWithDuplicate, "consent timestamp changes must not create duplicate records");
assert.equal(deleteRequests, 0, "duplicate formula matches must never trigger destructive deletes");

await persistAssessmentToAirtable(sampleBody({
  participantId: "2".repeat(32),
  createdAt: "2026-09-07T02:00:00.000Z",
  finalizedAt: "2026-09-07T02:05:00.000Z",
  profile: { name: "Second Participant", email: "second@example.com", relationship: "family-working", generation: "second" },
  privacyConsent: { acceptedAt: "2026-09-07T02:00:30.000Z" },
  reportRequest: { recipientEmail: "second@example.com", requestedAt: "2026-09-07T02:05:00.000Z" }
}));
assert.equal(TABLES["Comparison Groups"][0].fields["Participant Count"], 2);

const advisorComparison = await getComparisonGroupFromAirtable(GROUP_ID);
assert.equal(advisorComparison.participants.length, 2);
assert.equal(advisorComparison.participants[0].answers["en-full-vision-1"], 3);
assert.equal(advisorComparison.participants[1].role, "family-working");

await persistAssessmentToAirtable(sampleBody({
  participantId: "3".repeat(32),
  createdAt: "2026-09-07T03:00:00.000Z",
  finalizedAt: "2026-09-07T03:05:00.000Z",
  profile: { name: "Third Participant", email: "third@example.com", generation: "third-plus" },
  privacyConsent: { acceptedAt: "2026-09-07T03:00:30.000Z" },
  reportRequest: { recipientEmail: "third@example.com", requestedAt: "2026-09-07T03:05:00.000Z" }
}));
assert.equal(TABLES["Comparison Groups"][0].fields["Participant Count"], 3);

const countsAtCapacity = tableCounts();
await assert.rejects(
  () => persistAssessmentToAirtable(sampleBody({
    participantId: "4".repeat(32),
    createdAt: "2026-09-07T04:00:00.000Z",
    finalizedAt: "2026-09-07T04:05:00.000Z",
    profile: { name: "Fourth Participant", email: "fourth@example.com" },
    privacyConsent: { acceptedAt: "2026-09-07T04:00:30.000Z" },
    reportRequest: { recipientEmail: "fourth@example.com", requestedAt: "2026-09-07T04:05:00.000Z" }
  })),
  /already full/
);
assert.deepEqual(tableCounts(), countsAtCapacity, "capacity rejection must happen before any Airtable write");

await assert.rejects(
  () => persistAssessmentToAirtable(sampleBody({
    participantId: "5".repeat(32),
    groupId: SECOND_GROUP_ID,
    reportRequest: { recipientEmail: "victim@example.com" }
  })),
  /recipient must match/,
  "report recipients must be bound to profile email"
);
await assert.rejects(
  () => persistAssessmentToAirtable(sampleBody({ groupId: "GROUP123" })),
  /identifiers are invalid/,
  "short enumerable group IDs must be rejected"
);
await assert.rejects(
  () => persistAssessmentToAirtable(sampleBody({ profile: { email: "bad'\\email@example.com" } })),
  /email is invalid/,
  "formula metacharacters must not enter email-derived lookups"
);

console.log("Airtable persistence verification passed.");
