import assert from "node:assert/strict";
import { createApp } from "../server/index.js";
import { encodeActionToken } from "../server/summary-report.js";

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

async function requestText(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.text().catch(() => "");
  return { response, body };
}

const calls = [];
const app = createApp({
  async persistAssessment(body) {
    calls.push({ type: "persist", body });
    if (body?.forceValidationError) throw validationError("Respondent email is required");
    if (body?.forceServerError) throw new Error("Airtable is sad");
    if (body?.forceComparisonReady) {
      return {
        ok: true,
        persistence: "airtable",
        sessionKey: "session-test",
        group: { id: "GROUP123", participants: [{ id: "p1" }, { id: "p2" }] }
      };
    }
    return { ok: true, persistence: "airtable", sessionKey: "session-test" };
  },
  async getComparisonGroup(groupId) {
    calls.push({ type: "group", groupId });
    if (!groupId) throw new Error("Missing group key");
    if (groupId === "FAIL") throw new Error("Lookup failed");
    return { id: groupId, participants: [] };
  },
  async getGroupCount(groupId) {
    calls.push({ type: "group-count", groupId });
    if (groupId === "FAIL") throw new Error("Lookup failed");
    return groupId === "FULLGROUP" ? 3 : 1;
  },
  async sendSummaryEmails(body, result, options) {
    calls.push({ type: "email", body, result, options });
    return { skipped: true, reason: "test-email-sender" };
  },
  async sendInviteEmail(body) {
    calls.push({ type: "invite-email", body });
    return { sent: true, provider: "test-invite-sender" };
  },
  async sendCallRequest(body) {
    calls.push({ type: "call-request", body });
    return { sent: true, provider: "test-call-sender" };
  },
  async sendComparisonEmail(group, options) {
    calls.push({ type: "comparison-email", group, options });
    return { sent: true, provider: "test-comparison-sender" };
  }
});

const { server, baseUrl } = await listen(app);
const originalConsoleError = console.error;
console.error = () => {};

try {
  const saveOk = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ profile: { email: "kier@example.com" } })
  });
  assert.equal(saveOk.response.status, 200);
  assert.equal(saveOk.body.persistence, "airtable");
  assert.equal(saveOk.body.email.reason, "test-email-sender");
  assert.equal(calls.find((call) => call.type === "email").options.baseUrl, "http://localhost:5173");

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

  const inviteOk = await requestJson(baseUrl, "/api/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invitedEmail: "family@example.com",
      inviteLink: "https://gilbertdevlyn.com/diagnostic?group=GROUP123&lang=en",
      language: "en"
    })
  });
  assert.equal(inviteOk.response.status, 200);
  assert.equal(inviteOk.body.email.sent, true);
  assert.equal(inviteOk.body.email.provider, "test-invite-sender");

  const inviteWrongMethod = await requestJson(baseUrl, "/api/invitations", { method: "GET" });
  assert.equal(inviteWrongMethod.response.status, 405);
  assert.equal(inviteWrongMethod.response.headers.get("allow"), "POST");
  assert.equal(inviteWrongMethod.body.error, "Method not allowed");

  const groupsRemoved = await requestText(baseUrl, "/api/groups?group=GROUP123");
  assert.notEqual(groupsRemoved.response.headers.get("content-type")?.split(";")[0], "application/json");
  assert.doesNotMatch(groupsRemoved.body, /"participants"/);

  const comparisonReady = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: { email: "kier@example.com" }, forceComparisonReady: true })
  });
  assert.equal(comparisonReady.response.status, 200);
  const comparisonEmailCall = calls.find((call) => call.type === "comparison-email");
  assert.equal(comparisonEmailCall.group.id, "GROUP123");

  const comparisonToken = encodeActionToken({ groupId: "GROUP123", language: "en" });
  const comparisonOk = await requestJson(baseUrl, `/api/comparison?data=${comparisonToken}`);
  assert.equal(comparisonOk.response.status, 200);
  assert.equal(comparisonOk.body.group.id, "GROUP123");
  assert.equal(comparisonOk.body.language, "en");

  const comparisonInvalid = await requestJson(baseUrl, "/api/comparison?data=not-valid-base64url");
  assert.equal(comparisonInvalid.response.status, 400);

  const comparisonWrongMethod = await requestJson(baseUrl, "/api/comparison", { method: "POST" });
  assert.equal(comparisonWrongMethod.response.status, 405);
  assert.equal(comparisonWrongMethod.response.headers.get("allow"), "GET");

  const missingGroupStatus = await requestJson(baseUrl, "/api/group-status");
  assert.equal(missingGroupStatus.response.status, 400);
  assert.equal(missingGroupStatus.body.error, "Missing comparison group key");

  const groupStatusOpen = await requestJson(baseUrl, "/api/group-status?group=OPENGROUP");
  assert.equal(groupStatusOpen.response.status, 200);
  assert.equal(groupStatusOpen.body.participantCount, 1);
  assert.equal(groupStatusOpen.body.maxParticipants, 3);
  assert.equal(groupStatusOpen.body.group, undefined);
  assert.equal(groupStatusOpen.body.participants, undefined);

  const groupStatusFull = await requestJson(baseUrl, "/api/group-status?group=FULLGROUP");
  assert.equal(groupStatusFull.response.status, 200);
  assert.equal(groupStatusFull.body.participantCount, 3);

  const groupStatusFailure = await requestJson(baseUrl, "/api/group-status?group=FAIL");
  assert.equal(groupStatusFailure.response.status, 500);

  const groupStatusWrongMethod = await requestJson(baseUrl, "/api/group-status", { method: "POST" });
  assert.equal(groupStatusWrongMethod.response.status, 405);
  assert.equal(groupStatusWrongMethod.response.headers.get("allow"), "GET");

  const scheduleToken = encodeActionToken({
    name: "Kier",
    email: "kier@example.com",
    language: "en",
    participant: {
      phone: "+52 55 1234 5678",
      country: "Mexico",
      relationship: "Founder",
      generation: "First generation"
    },
    result: {
      overall: 70,
      level: "Level 3 - Established",
      focusAreas: ["Family Governance Bodies: 63/100"]
    },
    context: {
      groupId: "GROUP123",
      requestedAt: "Jun 20, 2026, 5:25 PM"
    }
  });
  const scheduleOk = await requestText(baseUrl, `/api/schedule-call?data=${scheduleToken}`);
  assert.equal(scheduleOk.response.status, 200);
  assert.match(scheduleOk.body, /Gilbert has been notified/);
  const callRequest = calls.find((call) => call.type === "call-request");
  assert.equal(callRequest.body.result.overall, 70);
  assert.equal(callRequest.body.participant.country, "Mexico");
  assert.equal(callRequest.body.context.groupId, "GROUP123");

  const scheduleEsToken = encodeActionToken({
    name: "Kier",
    email: "kier@example.com",
    language: "es"
  });
  const scheduleEsOk = await requestText(baseUrl, `/api/schedule-call?data=${scheduleEsToken}`);
  assert.equal(scheduleEsOk.response.status, 200);
  assert.match(scheduleEsOk.body, /Gilbert fue notificado/);

  const scheduleInvalid = await requestText(baseUrl, "/api/schedule-call?data=not-valid-base64url");
  assert.equal(scheduleInvalid.response.status, 400);
  assert.match(scheduleInvalid.body, /no longer valid/);

  const scheduleWrongMethod = await requestJson(baseUrl, "/api/schedule-call", { method: "POST" });
  assert.equal(scheduleWrongMethod.response.status, 405);
  assert.equal(scheduleWrongMethod.response.headers.get("allow"), "GET");
  assert.equal(scheduleWrongMethod.body.error, "Method not allowed");

  assert.deepEqual(
    calls.map((call) => call.type),
    [
      "persist",
      "email",
      "persist",
      "persist",
      "invite-email",
      "persist",
      "email",
      "comparison-email",
      "group",
      "group-count",
      "group-count",
      "group-count",
      "call-request",
      "call-request"
    ]
  );

  console.log("API route verification passed.");
} finally {
  console.error = originalConsoleError;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
