import assert from "node:assert/strict";

import { FULL_QUESTIONS, UNKNOWN_ANSWER } from "../src/data/assessment.js";
import { calculateResults, getStage, roundedScore } from "../src/utils/results.js";
import {
  answerValidationMessage,
  normalizeAssessmentSubmission
} from "../server/scoring.js";

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
  [question("ownership", 4)]: 5
});
const mixedOwnership = mixedUnknownResult.pillarScores.find((pillar) => pillar.id === "ownership");
assert.equal(mixedOwnership.scored, 3, "unknown answers should not count as numeric scores");
assert.equal(mixedOwnership.unknown, 1, "unknown answers should be counted for transparency");
assert.equal(mixedOwnership.answered, 4, "answered count should include numeric and unknown answers");
assert.equal(roundedScore(mixedOwnership.score), 67, "5, 0, and 5 should average to 3.33 out of 5");
assert.equal(mixedUnknownResult.transparency.unknownCount, 1);

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
  { id: "vision", scored: 1, unknown: 5, total: 6, minimumScored: 3 }
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

console.log("Scoring verification passed.");
