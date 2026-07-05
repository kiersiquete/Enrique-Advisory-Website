import { FULL_QUESTIONS, UNKNOWN_ANSWER } from "../src/data/assessment.js";
import { calculateResults } from "../src/utils/results.js";

const VALID_SCORES = new Set([0, 1, 2, 3, 4, 5]);

export function submissionLanguage(language) {
  return language === "es" ? "es" : "en";
}

export function submissionQuestions(body = {}) {
  return FULL_QUESTIONS[submissionLanguage(body.language)] ?? FULL_QUESTIONS.en;
}

export function answerValidationMessage(body = {}) {
  const answers = body.answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return "Assessment answers are required";
  }

  const entries = Object.entries(answers);
  if (entries.length === 0) {
    return "Assessment answers are required";
  }

  const questionIds = new Set(submissionQuestions(body).map((question) => question.id));
  for (const [questionId, value] of entries) {
    if (!questionIds.has(questionId)) {
      return "Assessment answers contain unknown question IDs";
    }

    if (value !== UNKNOWN_ANSWER && !VALID_SCORES.has(value)) {
      return "Assessment answers contain invalid score values";
    }
  }

  return "";
}

export function calculateSubmissionResult(body = {}) {
  return calculateResults(submissionQuestions(body), body.answers ?? {});
}

export function normalizeAssessmentSubmission(body = {}) {
  const language = submissionLanguage(body.language);
  const normalizedBody = {
    ...body,
    language
  };
  const result = calculateSubmissionResult(normalizedBody);

  return {
    ...normalizedBody,
    result,
    overall: result.overall,
    stageId: result.stage?.id,
    pillarScores: result.pillarScores,
    transparency: result.transparency
  };
}
