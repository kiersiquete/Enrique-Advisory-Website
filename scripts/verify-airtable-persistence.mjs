import assert from "node:assert/strict";

const TABLES = {
  Respondents: [],
  "Assessment Sessions": [],
  "Comparison Groups": [],
  "Assessment Answers": []
};

let recordCounter = 0;

process.env.AIRTABLE_API_TOKEN = "test-token";
process.env.AIRTABLE_BASE_ID = "appTestBase";

function nextRecordId() {
  recordCounter += 1;
  return `rec${String(recordCounter).padStart(4, "0")}`;
}

function tableNameFromUrl(url) {
  const pathname = new URL(url).pathname;
  const [, , , encodedTable] = pathname.split("/");
  return decodeURIComponent(encodedTable);
}

function recordIdFromUrl(url) {
  const pathname = new URL(url).pathname;
  const parts = pathname.split("/");
  return parts.length > 4 ? parts[4] : "";
}

function matchFormula(record, formula) {
  const match = formula?.match(/^\{(.+)\} = '(.+)'$/);
  if (!match) return true;
  const [, field, value] = match;
  return String(record.fields[field] ?? "") === value.replace(/\\'/g, "'");
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
    const body = JSON.parse(options.body);
    const record = { id: nextRecordId(), fields: body.fields };
    records.push(record);
    return jsonResponse(record);
  }

  if (method === "PATCH") {
    const recordId = recordIdFromUrl(url);
    const body = JSON.parse(options.body);
    const record = records.find((item) => item.id === recordId);
    assert.ok(record, `Record not found for PATCH: ${recordId}`);
    record.fields = { ...record.fields, ...body.fields };
    return jsonResponse(record);
  }

  if (method === "DELETE") {
    const params = new URL(url).searchParams;
    const ids = params.getAll("records[]");
    ids.forEach((id) => {
      const index = records.findIndex((record) => record.id === id);
      if (index >= 0) records.splice(index, 1);
    });
    return jsonResponse({ records: ids.map((id) => ({ id, deleted: true })) });
  }

  return jsonResponse({ error: "Unsupported method" }, false, 405);
};

const { persistAssessmentToAirtable, getComparisonGroupFromAirtable } = await import(
  "../server/airtable.js"
);

function sampleBody(overrides = {}) {
  return {
    createdAt: "2026-06-20T09:00:00.000Z",
    finalizedAt: "2026-06-20T09:05:00.000Z",
    language: "en",
    mode: "full",
    profile: {
      name: "Kier Test",
      email: "kier@example.com",
      phoneInternational: "+52 55 1234 5678",
      phoneCountryLabel: "Mexico",
      countryLabel: "Mexico",
      relationship: "founder",
      generation: "first"
    },
    answers: {
      "en-full-vision-1": 4,
      "en-full-constitution-1": 3
    },
    result: {
      overall: 70,
      stage: { id: "established", level: { en: "Level 3" }, labels: { en: "Established" } },
      transparency: { unknownCount: 0 },
      pillarScores: [
        { id: "vision", score: 70, scored: 2, unknown: 0, total: 2 },
        { id: "constitution", score: 60, scored: 2, unknown: 0, total: 2 }
      ]
    },
    reportRequest: {
      type: "summary",
      status: "requested",
      recipientEmail: "kier@example.com",
      language: "en",
      detailedAnalysisRetained: true,
      advisorDetail: {
        visibility: "internal",
        note: "Retained for Gilbert/admin follow-up.",
        delivery: {
          destination: "Airtable Raw Result JSON",
          nextStep: "Use this internal detail for Gilbert's follow-up."
        },
        pillarNotes: [{ id: "vision", label: "Vision", score: 70 }]
      },
      requestedAt: "2026-06-20T09:05:00.000Z"
    },
    ...overrides
  };
}

function tableCounts() {
  return Object.fromEntries(
    Object.entries(TABLES).map(([tableName, records]) => [tableName, records.length])
  );
}

const firstSave = await persistAssessmentToAirtable(sampleBody());
assert.equal(firstSave.ok, true);
assert.equal(TABLES.Respondents.length, 1, "respondent should be created");
assert.equal(TABLES["Assessment Sessions"].length, 1, "session should be created");
assert.equal(TABLES["Assessment Answers"].length, 1, "answers should be created");
assert.equal(TABLES["Comparison Groups"].length, 0, "group should not be created without a group id");
const firstRawResult = JSON.parse(TABLES["Assessment Sessions"][0].fields["Raw Result JSON"]);
assert.equal(firstRawResult.reportRequest.status, "requested", "summary report request should be retained");
assert.equal(
  firstRawResult.reportRequest.advisorDetail.visibility,
  "internal",
  "advisor detail should be retained for Gilbert/admin follow-up"
);
assert.equal(
  firstRawResult.reportRequest.advisorDetail.delivery.destination,
  "Airtable Raw Result JSON",
  "advisor detail delivery location should be documented"
);
const countsAfterFirstSave = tableCounts();
await persistAssessmentToAirtable(sampleBody());
assert.deepEqual(
  tableCounts(),
  countsAfterFirstSave,
  "saving the same standalone assessment again should update existing Airtable records without creating a duplicate respondent row"
);
assert.equal(
  TABLES.Respondents[0].fields.Notes,
  "Assessment key: kier@example.com|2026-06-20T09:00:00.000Z",
  "respondent records should keep an idempotency key for repeated saves"
);
assert.match(
  TABLES.Respondents[0].fields["Created At"],
  /^[A-Z][a-z]{2} \d{1,2}, 2026, \d{1,2}:\d{2} (AM|PM)$/,
  "respondent date should be readable"
);
assert.doesNotMatch(TABLES["Assessment Sessions"][0].fields["Finalized At"], /T/, "session date should not be ISO");

await persistAssessmentToAirtable(
  sampleBody({
    createdAt: "2026-06-20T10:00:00.000Z",
    finalizedAt: "2026-06-20T10:06:00.000Z",
    groupId: "GROUP123",
    participantId: "participant-1",
    groupParticipantCount: 1,
    inviteLink: "https://example.com/?group=GROUP123&lang=en"
  })
);

assert.equal(TABLES.Respondents.length, 2, "a new assessment session should create a new respondent row");
assert.equal(TABLES["Comparison Groups"].length, 1, "group should be created when group id is present");
assert.equal(TABLES["Comparison Groups"][0].fields["Participant Count"], 1);
assert.equal(TABLES["Comparison Groups"][0].fields["Invite Link"], "https://example.com/?group=GROUP123&lang=en");
const countsAfterFirstGroupSave = tableCounts();
await persistAssessmentToAirtable(
  sampleBody({
    createdAt: "2026-06-20T10:00:00.000Z",
    finalizedAt: "2026-06-20T10:06:00.000Z",
    groupId: "GROUP123",
    participantId: "participant-1",
    groupParticipantCount: 1,
    inviteLink: "https://example.com/?group=GROUP123&lang=en"
  })
);
assert.deepEqual(
  tableCounts(),
  countsAfterFirstGroupSave,
  "saving the same grouped assessment again should update existing records without creating a duplicate respondent row"
);

await persistAssessmentToAirtable(
  sampleBody({
    createdAt: "2026-06-20T10:20:00.000Z",
    finalizedAt: "2026-06-20T10:26:00.000Z",
    groupId: "GROUP123",
    participantId: "participant-2",
    groupParticipantCount: 2,
    profile: {
      ...sampleBody().profile,
      name: "Second Participant",
      email: "second@example.com",
      relationship: "family-working",
      generation: "second"
    }
  })
);

assert.equal(TABLES.Respondents.length, 3, "each distinct saved assessment should create one respondent row");
assert.equal(TABLES["Comparison Groups"][0].fields["Participant Count"], 2);
assert.equal(TABLES["Comparison Groups"][0].fields.Status, "Ready for Comparison");

const comparison = await getComparisonGroupFromAirtable("GROUP123");
assert.equal(comparison.participants.length, 2, "comparison endpoint should return saved participants");
assert.equal(comparison.participants[0].result.overall, 70);
assert.equal(comparison.participants[1].role, "family-working");

await persistAssessmentToAirtable(
  sampleBody({
    createdAt: "2026-06-20T11:00:00.000Z",
    finalizedAt: "2026-06-20T11:02:00.000Z",
    groupId: "ZERO123",
    participantId: "participant-zero",
    profile: {
      ...sampleBody().profile,
      name: "Zero Score",
      email: "zero@example.com"
    },
    result: {
      ...sampleBody().result,
      overall: 0,
      pillarScores: [{ id: "vision", score: 0, scored: 2, unknown: 0, total: 2 }]
    }
  })
);

const zeroComparison = await getComparisonGroupFromAirtable("ZERO123");
assert.equal(zeroComparison.participants.length, 1, "zero-score participants should still appear");
assert.equal(zeroComparison.participants[0].result.overall, 0);

await assert.rejects(
  () => persistAssessmentToAirtable({}),
  /Respondent email is required/,
  "invalid payloads should fail before Airtable writes"
);

console.log("Airtable persistence verification passed.");
