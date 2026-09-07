import assert from "node:assert/strict";

import { FULL_QUESTIONS, UNKNOWN_ANSWER } from "../src/data/assessment.js";
import { calculateResults, getStage, roundedScore } from "../src/utils/results.js";
import {
  answerValidationMessage,
  normalizeAssessmentSubmission,
  validateAssessmentSubmission
} from "../server/scoring.js";
import { PRIVACY_POLICY_VERSION } from "../server/validation.js";

function question(pillarId, number, language = "en") {
  const item = FULL_QUESTIONS[language].find(
    (candidate) => candidate.pillarId === pillarId && candidate.number === number
  );
  assert.ok(item, `Missing ${language} question ${pillarId} #${number}`);
  return item.id;
}

const gilbertZeroCase = {
  [question("vision", 1)]: 0,
  [question("vision", 2)]: 0,
  [question("vision", 3)]: 0,
  [question("vision", 4)]: 0,
  [question("vision", 5)]: 5
};
const gilbertZeroResult = calculateResults(FULL_QUESTIONS.en, gilbertZeroCase);
const gilbertVision = gilbertZeroResult.pillarScores.find((pillar) => pillar.id === "vision");
assert.equal(gilbertVision.scored, 5, "zero answers should count as scored answers");
assert.equal(gilbertVision.average, 1, "0,0,0,0,5 should average to 1 out of 5");
assert.equal(roundedScore(gilbertVision.score), 20, "0,0,0,0,5 should score as 20/100");
assert.equal(roundedScore(gilbertZeroResult.overall), 20, "overall should include the zero-weighted pillar");

const allZeroResult = calculateResults(FULL_QUESTIONS.en, {
  [question("board", 1)]: 0,
  [question("board", 2)]: 0,
  [question("board", 3)]: 0
});
const allZeroBoard = allZeroResult.pillarScores.find((pillar) => pillar.id === "board");
assert.equal(allZeroBoard.scored, 3);
assert.equal(allZeroBoard.score, 0, "all zero answers should produce a 0 score");
assert.equal(allZeroResult.overall, 0, "a scored 0 pillar should remain in the overall result");

const mixedUnknownResult = calculateResults(FULL_QUESTIONS.en, {
  [question("ownership", 1)]: 5,
  [question("ownership", 2)]: UNKNOWN_ANSWER,
  [question("ownership", 3)]: 0,
  [question("ownership", 4)]: 5,
  [question("ownership", 5)]: 3,
  [question("ownership", 6)]: 2
});
const mixedOwnership = mixedUnknownResult.pillarScores.find((pillar) => pillar.id === "ownership");
assert.equal(mixedOwnership.scored, 5, "unknown answers should not count as numeric scores");
assert.equal(mixedOwnership.unknown, 1, "unknown answers should be counted for transparency");
assert.equal(mixedOwnership.answered, 6, "answered count should include numeric and unknown answers");
assert.equal(roundedScore(mixedOwnership.score), 60, "5, 0, 5, 3, and 2 should average to 3 out of 5");
assert.equal(mixedUnknownResult.transparency.unknownCount, 1);

// 6-question pillar, exactly 50% unknown (3 of 6) -> not-determined.
const halfUnknownEvenResult = calculateResults(FULL_QUESTIONS.en, {
  [question("board", 1)]: 5,
  [question("board", 2)]: 5,
  [question("board", 3)]: 5,
  [question("board", 4)]: UNKNOWN_ANSWER,
  [question("board", 5)]: UNKNOWN_ANSWER,
  [question("board", 6)]: UNKNOWN_ANSWER
});
const halfUnknownBoard = halfUnknownEvenResult.pillarScores.find((pillar) => pillar.id === "board");
assert.equal(halfUnknownBoard.lowConfidence, true, "50% unknown on an even pillar should be low confidence");
assert.equal(halfUnknownBoard.score, null, "50% unknown on an even pillar should not display a score");

// 6-question pillar, just under 50% unknown (2 of 6) -> still confidently scored.
const underHalfUnknownEvenResult = calculateResults(FULL_QUESTIONS.en, {
  [question("management", 1)]: 5,
  [question("management", 2)]: 5,
  [question("management", 3)]: 5,
  [question("management", 4)]: 5,
  [question("management", 5)]: UNKNOWN_ANSWER,
  [question("management", 6)]: UNKNOWN_ANSWER
});
const underHalfUnknownManagement = underHalfUnknownEvenResult.pillarScores.find(
  (pillar) => pillar.id === "management"
);
assert.equal(
  underHalfUnknownManagement.lowConfidence,
  false,
  "just under 50% unknown on an even pillar should still be scored"
);
assert.equal(roundedScore(underHalfUnknownManagement.score), 100);

// 7-question pillar, 4 of 7 unknown (>50%) -> not-determined, matching the majority-unknown rule.
const majorityUnknownOddResult = calculateResults(FULL_QUESTIONS.en, {
  [question("next-generation", 1)]: 5,
  [question("next-generation", 2)]: 4,
  [question("next-generation", 3)]: 3,
  [question("next-generation", 4)]: UNKNOWN_ANSWER,
  [question("next-generation", 5)]: UNKNOWN_ANSWER,
  [question("next-generation", 6)]: UNKNOWN_ANSWER,
  [question("next-generation", 7)]: UNKNOWN_ANSWER
});
const majorityUnknownNextGen = majorityUnknownOddResult.pillarScores.find(
  (pillar) => pillar.id === "next-generation"
);
assert.equal(majorityUnknownNextGen.lowConfidence, true, "4 of 7 unknown should be low confidence");
assert.equal(majorityUnknownNextGen.score, null, "4 of 7 unknown should not display a score");

const zeroAndPerfectResult = calculateResults(FULL_QUESTIONS.en, {
  [question("vision", 1)]: 0,
  [question("vision", 2)]: 0,
  [question("vision", 3)]: 0,
  [question("constitution", 1)]: 5,
  [question("constitution", 2)]: 5,
  [question("constitution", 3)]: 5
});
assert.equal(
  roundedScore(zeroAndPerfectResult.overall),
  50,
  "overall scoring must include a pillar that has a valid 0 score"
);

const unknownHeavyResult = calculateResults(FULL_QUESTIONS.en, {
  [question("vision", 1)]: 5,
  [question("vision", 2)]: UNKNOWN_ANSWER,
  [question("vision", 3)]: UNKNOWN_ANSWER,
  [question("vision", 4)]: UNKNOWN_ANSWER,
  [question("vision", 5)]: UNKNOWN_ANSWER,
  [question("vision", 6)]: UNKNOWN_ANSWER
});
const unknownHeavyVision = unknownHeavyResult.pillarScores.find((pillar) => pillar.id === "vision");
assert.equal(unknownHeavyVision.scored, 1);
assert.equal(unknownHeavyVision.unknown, 5);
assert.equal(unknownHeavyVision.lowConfidence, true);
assert.equal(unknownHeavyVision.includedInOverall, false);
assert.equal(unknownHeavyVision.score, null, "one scored answer plus many unknowns should not display as 100/100");
assert.equal(unknownHeavyResult.overall, 0, "low-confidence-only results should not inflate the overall score");
assert.deepEqual(unknownHeavyResult.transparency.lowConfidenceByPillar, [
  { id: "vision", scored: 1, unknown: 5, total: 6, minimumScored: 4 }
]);

assert.equal(getStage(25).id, "foundational");
assert.equal(getStage(26).id, "emerging");
assert.equal(getStage(50).id, "emerging");
assert.equal(getStage(51).id, "established");
assert.equal(getStage(75).id, "established");
assert.equal(getStage(76).id, "advanced");

const normalized = normalizeAssessmentSubmission({
  language: "en",
  answers: gilbertZeroCase,
  result: {
    overall: 100,
    stage: { id: "advanced" },
    transparency: { unknownCount: 0 },
    pillarScores: [{ id: "vision", score: 100, scored: 5, unknown: 0, total: 5 }]
  }
});
assert.equal(
  roundedScore(normalized.result.overall),
  20,
  "server normalization should overwrite stale client-submitted overall scores"
);
assert.equal(normalized.overall, normalized.result.overall);
assert.equal(normalized.stageId, "foundational");

assert.equal(
  answerValidationMessage({
    language: "en",
    answers: { [question("vision", 1)]: "0" }
  }),
  "Assessment answers contain invalid score values",
  "score values must be numeric 0-5 values, not strings"
);
assert.equal(
  answerValidationMessage({
    language: "en",
    answers: { [question("vision", 1)]: 6 }
  }),
  "Assessment answers contain invalid score values"
);
assert.equal(
  answerValidationMessage({
    language: "en",
    answers: { "unknown-question": 3 }
  }),
  "Assessment answers contain unknown question IDs"
);

assert.equal(
  answerValidationMessage({
    language: "en",
    answers: { [question("vision", 1)]: 3 }
  }),
  "Assessment answers must include every question",
  "partial assessments must not be accepted by the API"
);

const completeAnswers = Object.fromEntries(FULL_QUESTIONS.en.map((item) => [item.id, 3]));
const validSubmission = normalizeAssessmentSubmission({
  createdAt: "2026-09-07T01:00:00.000Z",
  finalizedAt: "2026-09-07T01:05:00.000Z",
  mode: "full",
  language: "en",
  profile: {
    name: "Security Test",
    email: "SECURITY@example.com",
    phoneCountry: "mx",
    phoneCountryLabel: "MX",
    phoneDialCode: "+52",
    phoneNumber: "55 1234 5678",
    phoneDigits: "5512345678",
    phoneInternational: "+52 55 1234 5678",
    relationship: "founder",
    generation: "first",
    country: "mx",
    countryLabel: "Mexico"
  },
  answers: completeAnswers,
  groupId: "a".repeat(32),
  participantId: "b".repeat(32),
  privacyConsent: {
    accepted: true,
    policyVersion: PRIVACY_POLICY_VERSION,
    acceptedAt: "2026-09-07T01:00:30.000Z"
  },
  reportRequest: {
    type: "summary",
    status: "requested",
    recipientEmail: "security@example.com",
    language: "en",
    contactRequested: false,
    requestedAt: "2026-09-07T01:05:00.000Z"
  },
  result: { overall: 100 },
  groupParticipantCount: 99,
  inviteLink: "https://attacker.invalid"
});

assert.doesNotThrow(() => validateAssessmentSubmission(validSubmission));
assert.equal(validSubmission.profile.email, "security@example.com");
assert.equal(validSubmission.result.overall, 60, "the server must recalculate the client result");
assert.equal(validSubmission.groupParticipantCount, undefined, "client participant counts must be discarded");
assert.equal(validSubmission.inviteLink, undefined, "client invitation URLs must be discarded");

assert.throws(
  () => validateAssessmentSubmission({
    ...validSubmission,
    reportRequest: { ...validSubmission.reportRequest, recipientEmail: "victim@example.com" }
  }),
  /recipient must match/,
  "reports must only be sent to the validated profile email"
);
assert.throws(
  () => validateAssessmentSubmission({
    ...validSubmission,
    privacyConsent: { ...validSubmission.privacyConsent, accepted: false }
  }),
  /privacy consent/,
  "a versioned explicit privacy acknowledgement is required"
);
assert.throws(
  () => validateAssessmentSubmission({ ...validSubmission, groupId: "short-group" }),
  /identifiers are invalid/,
  "group identifiers must contain 128 bits of entropy"
);

console.log("Scoring verification passed.");
