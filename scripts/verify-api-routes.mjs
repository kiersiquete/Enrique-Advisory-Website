import assert from "node:assert/strict";

import { createApp } from "../server/index.js";
import { resetRateLimitsForTests } from "../server/http-security.js";
import { PRIVACY_POLICY_VERSION, validationError } from "../server/validation.js";
import { FULL_QUESTIONS } from "../src/data/assessment.js";

delete process.env.TRUST_PROXY;
delete process.env.VERCEL;

const GROUP_ID = "a".repeat(32);
const FULL_GROUP_ID = "f".repeat(32);
const COMPLETE_ANSWERS = Object.fromEntries(FULL_QUESTIONS.en.map((question) => [question.id, 3]));

function sampleBody(name = "Kier Test") {
  const createdAt = "2026-09-07T01:00:00.000Z";
  const finalizedAt = "2026-09-07T01:05:00.000Z";
  return {
    createdAt,
    finalizedAt,
    mode: "full",
    language: "en",
    profile: {
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`,
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
      countryLabel: "Mexico"
    },
    answers: COMPLETE_ANSWERS,
    groupId: GROUP_ID,
    participantId: "1".repeat(32),
    privacyConsent: {
      accepted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      acceptedAt: "2026-09-07T01:00:30.000Z"
    },
    reportRequest: {
      type: "summary",
      status: "requested",
      recipientEmail: `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`,
      language: "en",
      contactRequested: false,
      requestedAt: finalizedAt
    }
  };
}

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const calls = [];
resetRateLimitsForTests();
const app = createApp({
  async persistAssessment(body) {
    calls.push({ type: "persist", body });
    if (body.profile.name === "Persistence Validation") throw validationError("Persistence rejected the record");
    if (body.profile.name === "Persistence Error") throw new Error("Internal persistence detail");
    const comparisonReady = body.profile.name === "Comparison Ready";
    const duplicate = body.profile.name === "Duplicate Submission";
    return {
      ok: true,
      persistence: "airtable",
      result: body.result,
      groupStatus: {
        participantCount: comparisonReady ? 2 : 1,
        maxParticipants: 3,
        isComplete: false
      },
      isNewSubmission: !duplicate,
      sessionKey: "must-not-leak",
      group: {
        participants: [{ email: "other@example.com", answers: { secret: 5 } }]
      }
    };
  },
  async getComparisonGroup(groupId) {
    calls.push({ type: "advisor-group", groupId });
    return {
      id: groupId,
      participants: [
        { id: "1".repeat(32), answers: { secret: 5 }, result: { overall: 60, pillarScores: [] } },
        { id: "2".repeat(32), answers: { secret: 1 }, result: { overall: 40, pillarScores: [] } }
      ]
    };
  },
  async getGroupCount(groupId) {
    calls.push({ type: "group-count", groupId });
    return groupId === FULL_GROUP_ID ? 3 : 1;
  },
  async sendSummaryEmails(body, result, options) {
    calls.push({ type: "summary-email", body, result, options });
    return { sent: true, provider: "test", messageId: "private-message-id" };
  },
  async sendComparisonEmail(group) {
    calls.push({ type: "comparison-email", group });
    return { sent: true, provider: "test" };
  }
});

const { server, baseUrl } = await listen(app);
const originalConsoleError = console.error;
console.error = () => {};

try {
  const saveOk = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(sampleBody())
  });
  assert.equal(saveOk.response.status, 200);
  assert.equal(saveOk.body.persistence, "airtable");
  assert.equal(saveOk.body.email.sent, true);
  assert.equal(saveOk.body.email.messageId, undefined, "provider identifiers must remain private");
  assert.equal(saveOk.body.group, undefined, "participant responses must not include advisor group data");
  assert.equal(saveOk.body.sessionKey, undefined);
  assert.doesNotMatch(JSON.stringify(saveOk.body), /other@example\.com|"answers"|secret/);
  assert.match(saveOk.response.headers.get("cache-control"), /no-store/);
  assert.equal(saveOk.response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(saveOk.response.headers.get("x-frame-options"), "DENY");
  assert.equal(saveOk.response.headers.get("x-powered-by"), null);
  assert.equal(calls.find((call) => call.type === "summary-email").options.baseUrl, "http://localhost:5173");

  const invalid = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.body.error, "Respondent name is invalid");

  const malformedResponse = await fetch(`${baseUrl}/api/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not-json"
  });
  const malformedBody = await malformedResponse.text();
  assert.equal(malformedResponse.status, 400);
  assert.match(malformedBody, /Request body must be valid JSON/);
  assert.doesNotMatch(malformedBody, /D:\\|server[\\/]index\.js|SyntaxError/);

  resetRateLimitsForTests();

  const oversizedResponse = await fetch(`${baseUrl}/api/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(70 * 1024) })
  });
  assert.equal(oversizedResponse.status, 413);
  assert.deepEqual(await oversizedResponse.json(), { error: "Request body is too large" });

  resetRateLimitsForTests();

  const serverFailure = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sampleBody("Persistence Error"))
  });
  assert.equal(serverFailure.response.status, 500);
  assert.equal(serverFailure.body.error, "Unable to save assessment result");

  const comparisonReady = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sampleBody("Comparison Ready"))
  });
  assert.equal(comparisonReady.response.status, 200);
  assert.equal(comparisonReady.body.group, undefined);
  assert.ok(calls.some((call) => call.type === "advisor-group"));
  assert.ok(calls.some((call) => call.type === "comparison-email"));

  const duplicate = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sampleBody("Duplicate Submission"))
  });
  assert.equal(duplicate.response.status, 200);
  assert.equal(duplicate.body.email.reason, "duplicate-submission");

  for (const name of ["Rate Limit Four", "Rate Limit Five"]) {
    const allowed = await requestJson(baseUrl, "/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleBody(name))
    });
    assert.equal(allowed.response.status, 200);
  }

  const spoofedRateLimit = await requestJson(baseUrl, "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.50" },
    body: JSON.stringify(sampleBody("Rate Limit Bypass"))
  });
  assert.equal(spoofedRateLimit.response.status, 429, "untrusted forwarding headers must not bypass rate limits");

  const crossOrigin = await requestJson(baseUrl, "/api/group-status?group=" + GROUP_ID, {
    headers: { Origin: "https://attacker.invalid" }
  });
  assert.equal(crossOrigin.response.status, 403);
  assert.equal(crossOrigin.body.error, "Cross-origin request denied");

  const groupOpen = await requestJson(baseUrl, "/api/group-status?group=" + GROUP_ID);
  assert.equal(groupOpen.response.status, 200);
  assert.deepEqual(groupOpen.body, { ok: true, participantCount: 1, maxParticipants: 3 });
  assert.match(groupOpen.response.headers.get("cache-control"), /no-store/);

  const groupFull = await requestJson(baseUrl, "/api/group-status?group=" + FULL_GROUP_ID);
  assert.equal(groupFull.response.status, 200);
  assert.equal(groupFull.body.participantCount, 3);

  const invalidGroup = await requestJson(baseUrl, "/api/group-status?group=GROUP123");
  assert.equal(invalidGroup.response.status, 400);

  for (const [path, expectedStatus] of [
    ["/api/invitations", 410],
    ["/api/summary-pdf?data=forged", 410],
    ["/api/schedule-call?data=forged", 410],
    ["/api/advisor-report-pdf?data=forged", 404],
    ["/api/comparison?data=forged", 404]
  ]) {
    const disabled = await requestJson(baseUrl, path);
    assert.equal(disabled.response.status, expectedStatus, `${path} must remain unavailable`);
  }

  const unknownApiRoute = await requestJson(baseUrl, "/api/unknown");
  assert.equal(unknownApiRoute.response.status, 404);
  assert.deepEqual(unknownApiRoute.body, { error: "Not found" });

  const wrongMethod = await requestJson(baseUrl, "/api/results");
  assert.equal(wrongMethod.response.status, 405);
  assert.equal(wrongMethod.response.headers.get("allow"), "POST");

  assert.equal(calls.some((call) => call.type === "invite-email"), false);
  assert.equal(calls.some((call) => call.type === "call-request"), false);

  console.log("API route verification passed.");
} finally {
  console.error = originalConsoleError;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
