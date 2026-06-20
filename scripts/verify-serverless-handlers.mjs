import assert from "node:assert/strict";

process.env.AIRTABLE_API_TOKEN = "test-token";
process.env.AIRTABLE_BASE_ID = "appTestBase";

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
    }
  };
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
  const method = options.method ?? "GET";
  const pathname = new URL(url).pathname;
  const tableName = decodeURIComponent(pathname.split("/")[3] ?? "");

  if (tableName === "Respondents" && method === "GET") return airtableJson({ records: [] });
  if (tableName === "Respondents" && method === "POST") {
    return airtableJson({ id: "rec-respondent", fields: JSON.parse(options.body).fields });
  }
  if (tableName === "Assessment Sessions" && method === "GET") {
    if (url.includes("SERVERLESSGROUP")) {
      return airtableJson({
        records: [
          {
            id: "rec-session-group",
            fields: {
              "Participant ID": "participant-serverless",
              "Completed At": "Jun 20, 2026, 5:05 PM",
              "Overall Score": 72,
              "Raw Result JSON": JSON.stringify({
                language: "en",
                profile: {
                  relationship: "founder",
                  generation: "first",
                  country: "mx"
                },
                answers: { "en-full-vision-1": 4 },
                result: {
                  overall: 72,
                  stage: { id: "established" },
                  transparency: { unknownCount: 0 },
                  pillarScores: [{ id: "vision", score: 72, scored: 1, unknown: 0, total: 1 }]
                }
              })
            }
          }
        ]
      });
    }
    return airtableJson({ records: [] });
  }
  if (tableName === "Assessment Sessions" && method === "POST") {
    return airtableJson({ id: "rec-session", fields: JSON.parse(options.body).fields });
  }
  if (tableName === "Assessment Answers" && method === "GET") return airtableJson({ records: [] });
  if (tableName === "Assessment Answers" && method === "POST") {
    return airtableJson({ id: "rec-answer", fields: JSON.parse(options.body).fields });
  }
  if (tableName === "Comparison Groups" && method === "GET") {
    if (url.includes("SERVERLESSGROUP")) {
      return airtableJson({
        records: [
          {
            id: "rec-group",
            fields: {
              "Group Key": "SERVERLESSGROUP",
              "Participant Count": 1,
              Status: "Waiting for Participants"
            }
          }
        ]
      });
    }
    return airtableJson({ records: [] });
  }
  if (tableName === "Comparison Groups" && method === "POST") {
    return airtableJson({ id: "rec-group", fields: JSON.parse(options.body).fields });
  }

  return airtableJson({ error: { message: `Unexpected Airtable request: ${method} ${tableName}` } }, false);
};

const resultsHandler = (await import("../api/results.js")).default;
const groupsHandler = (await import("../api/groups.js")).default;

const invalidResultResponse = createResponse();
await resultsHandler({ method: "POST", body: {} }, invalidResultResponse);
assert.equal(invalidResultResponse.statusCode, 400);
assert.equal(invalidResultResponse.body.error, "Respondent email is required");

const methodResultResponse = createResponse();
await resultsHandler({ method: "GET", body: {} }, methodResultResponse);
assert.equal(methodResultResponse.statusCode, 405);
assert.equal(methodResultResponse.headers.Allow, "POST");

const validResultResponse = createResponse();
await resultsHandler(
  {
    method: "POST",
    body: {
      createdAt: "2026-06-20T09:00:00.000Z",
      finalizedAt: "2026-06-20T09:05:00.000Z",
      language: "en",
      mode: "full",
      profile: { name: "Kier", email: "kier@example.com" },
      answers: { "en-full-vision-1": 4 },
      result: {
        overall: 70,
        stage: { id: "established" },
        transparency: { unknownCount: 0 },
        pillarScores: [{ id: "vision", score: 70, scored: 1, unknown: 0, total: 1 }]
      }
    }
  },
  validResultResponse
);
assert.equal(validResultResponse.statusCode, 200);
assert.equal(validResultResponse.body.persistence, "airtable");

const stringBodyResultResponse = createResponse();
await resultsHandler(
  {
    method: "POST",
    body: JSON.stringify({
      createdAt: "2026-06-20T09:10:00.000Z",
      finalizedAt: "2026-06-20T09:15:00.000Z",
      language: "en",
      mode: "full",
      profile: { name: "String Body", email: "string@example.com" },
      answers: { "en-full-vision-1": 5 },
      result: {
        overall: 80,
        stage: { id: "strength" },
        transparency: { unknownCount: 0 },
        pillarScores: [{ id: "vision", score: 80, scored: 1, unknown: 0, total: 1 }]
      }
    })
  },
  stringBodyResultResponse
);
assert.equal(stringBodyResultResponse.statusCode, 200);
assert.equal(stringBodyResultResponse.body.persistence, "airtable");

const missingGroupResponse = createResponse();
await groupsHandler({ method: "GET", query: {} }, missingGroupResponse);
assert.equal(missingGroupResponse.statusCode, 400);
assert.equal(missingGroupResponse.body.error, "Missing comparison group key");

const methodGroupResponse = createResponse();
await groupsHandler({ method: "POST", query: {} }, methodGroupResponse);
assert.equal(methodGroupResponse.statusCode, 405);
assert.equal(methodGroupResponse.headers.Allow, "GET");

const validGroupResponse = createResponse();
await groupsHandler({ method: "GET", query: { group: "SERVERLESSGROUP" } }, validGroupResponse);
assert.equal(validGroupResponse.statusCode, 200);
assert.equal(validGroupResponse.body.group.id, "SERVERLESSGROUP");
assert.equal(validGroupResponse.body.group.participants.length, 1);
assert.equal(validGroupResponse.body.group.participants[0].id, "participant-serverless");
assert.equal(validGroupResponse.body.group.participants[0].result.overall, 72);

console.log("Serverless handler verification passed.");
