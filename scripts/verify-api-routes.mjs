import assert from "node:assert/strict";
import { createApp } from "../server/index.js";

function validationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const calls = [];
const app = createApp({
  async persistAssessment(body) {
    calls.push({ type: "persist", body });
    if (body?.forceValidationError) throw validationError("Respondent email is required");
    if (body?.forceServerError) throw new Error("Airtable is sad");
    return { ok: true, persistence: "airtable", sessionKey: "session-test" };
  },
  async getComparisonGroup(groupId) {
    calls.push({ type: "group", groupId });
    if (!groupId) throw new Error("Missing group key");
    if (groupId === "FAIL") throw new Error("Lookup failed");
    return { id: groupId, participants: [] };
  }
});

const { server, baseUrl } = await listen(app);
const originalConsoleError = console.error;
console.error = () => {};

try {
  const saveOk = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: { email: "kier@example.com" } })
  });
  assert.equal(saveOk.response.status, 200);
  assert.equal(saveOk.body.persistence, "airtable");

  const validation = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceValidationError: true })
  });
  assert.equal(validation.response.status, 400);
  assert.equal(validation.body.error, "Respondent email is required");

  const saveFailure = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceServerError: true })
  });
  assert.equal(saveFailure.response.status, 500);
  assert.equal(saveFailure.body.error, "Unable to save assessment result");

  const resultWrongMethod = await requestJson(baseUrl, "/api/results", { method: "GET" });
  assert.equal(resultWrongMethod.response.status, 405);
  assert.equal(resultWrongMethod.response.headers.get("allow"), "POST");
  assert.equal(resultWrongMethod.body.error, "Method not allowed");

  const missingGroup = await requestJson(baseUrl, "/api/groups");
  assert.equal(missingGroup.response.status, 400);
  assert.equal(missingGroup.body.error, "Missing comparison group key");

  const groupOk = await requestJson(baseUrl, "/api/groups?group=GROUP123");
  assert.equal(groupOk.response.status, 200);
  assert.equal(groupOk.body.group.id, "GROUP123");

  const groupFailure = await requestJson(baseUrl, "/api/groups?group=FAIL");
  assert.equal(groupFailure.response.status, 500);
  assert.equal(groupFailure.body.error, "Unable to load comparison group");

  const groupWrongMethod = await requestJson(baseUrl, "/api/groups", { method: "POST" });
  assert.equal(groupWrongMethod.response.status, 405);
  assert.equal(groupWrongMethod.response.headers.get("allow"), "GET");
  assert.equal(groupWrongMethod.body.error, "Method not allowed");

  assert.deepEqual(
    calls.map((call) => call.type),
    ["persist", "persist", "persist", "group", "group", "group"]
  );

  console.log("API route verification passed.");
} finally {
  console.error = originalConsoleError;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
