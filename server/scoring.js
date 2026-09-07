import { FULL_QUESTIONS, UNKNOWN_ANSWER } from "../src/data/assessment.js";
import { calculateResults } from "../src/utils/results.js";
import {
  hasUnsafeControlCharacters,
  isValidEmailAddress,
  isValidIsoDate,
  isValidOpaqueId,
  normalizeEmailAddress,
  PRIVACY_POLICY_VERSION,
  validationError
} from "./validation.js";

const VALID_SCORES = new Set([0, 1, 2, 3, 4, 5]);
const VALID_RELATIONSHIPS = new Set([
  "founder",
  "family-working",
  "family-not-working",
  "shareholder-non-family",
  "spouse-partner",
  "other"
]);
const VALID_GENERATIONS = new Set(["first", "second", "third-plus"]);

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

  const questions = submissionQuestions(body);
  const questionIds = new Set(questions.map((question) => question.id));
  for (const [questionId, value] of entries) {
    if (!questionIds.has(questionId)) {
      return "Assessment answers contain unknown question IDs";
    }

    if (value !== UNKNOWN_ANSWER && !VALID_SCORES.has(value)) {
      return "Assessment answers contain invalid score values";
    }
  }

  if (entries.length !== questions.length || questions.some((question) => !(question.id in answers))) {
    return "Assessment answers must include every question";
  }

  return "";
}

export function calculateSubmissionResult(body = {}) {
  return calculateResults(submissionQuestions(body), body.answers ?? {});
}

export function normalizeAssessmentSubmission(body = {}) {
  const language = submissionLanguage(body.language);
  const sourceProfile = body.profile ?? {};
  const sourceConsent = body.privacyConsent ?? {};
  const sourceReportRequest = body.reportRequest ?? {};
  const normalizedBody = {
    createdAt: body.createdAt,
    finalizedAt: body.finalizedAt,
    mode: body.mode,
    language,
    profile: {
      name: String(sourceProfile.name ?? "").trim(),
      email: normalizeEmailAddress(sourceProfile.email),
      phoneCountry: String(sourceProfile.phoneCountry ?? "").trim().toLowerCase(),
      phoneCountryLabel: String(sourceProfile.phoneCountryLabel ?? "").trim(),
      phoneDialCode: String(sourceProfile.phoneDialCode ?? "").trim(),
      phoneNumber: String(sourceProfile.phoneNumber ?? "").trim(),
      phoneDigits: String(sourceProfile.phoneDigits ?? "").replace(/\D/g, ""),
      phoneInternational: String(sourceProfile.phoneInternational ?? "").trim(),
      relationship: String(sourceProfile.relationship ?? "").trim(),
      relationshipLabel: String(sourceProfile.relationshipLabel ?? "").trim(),
      relationshipOther: String(sourceProfile.relationshipOther ?? "").trim(),
      generation: String(sourceProfile.generation ?? "").trim(),
      generationLabel: String(sourceProfile.generationLabel ?? "").trim(),
      country: String(sourceProfile.country ?? "").trim().toLowerCase(),
      countryLabel: String(sourceProfile.countryLabel ?? "").trim()
    },
    answers:
      body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
        ? { ...body.answers }
        : body.answers,
    groupId: String(body.groupId ?? "").trim().toLowerCase(),
    participantId: String(body.participantId ?? "").trim().toLowerCase(),
    privacyConsent: {
      accepted: sourceConsent.accepted === true,
      policyVersion: String(sourceConsent.policyVersion ?? "").trim(),
      acceptedAt: sourceConsent.acceptedAt
    },
    reportRequest: {
      type: sourceReportRequest.type,
      status: sourceReportRequest.status,
      recipientEmail: normalizeEmailAddress(sourceReportRequest.recipientEmail),
      language:
        sourceReportRequest.language === "es"
          ? "es"
          : sourceReportRequest.language === "en"
            ? "en"
            : "",
      contactRequested: sourceReportRequest.contactRequested === true,
      requestedAt: sourceReportRequest.requestedAt
    }
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

export function validateAssessmentSubmission(body = {}) {
  const profile = body.profile ?? {};
  const name = String(profile.name ?? "");

  if (!name || name.length > 120 || hasUnsafeControlCharacters(name)) {
    throw validationError("Respondent name is invalid");
  }
  if (!isValidEmailAddress(profile.email)) {
    throw validationError("Respondent email is invalid");
  }

  for (const value of [
    profile.phoneCountryLabel,
    profile.relationshipLabel,
    profile.relationshipOther,
    profile.generationLabel,
    profile.countryLabel
  ]) {
    if (String(value ?? "").length > 120 || hasUnsafeControlCharacters(value)) {
      throw validationError("Respondent profile contains invalid text");
    }
  }
  for (const value of [profile.phoneNumber, profile.phoneInternational]) {
    if (String(value ?? "").length > 40 || hasUnsafeControlCharacters(value)) {
      throw validationError("Respondent phone number is invalid");
    }
  }

  const phoneDigits = String(profile.phoneDigits || profile.phoneInternational || profile.phoneNumber || "").replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    throw validationError("Respondent phone number is invalid");
  }
  if (!/^[a-z]{2}$/.test(profile.phoneCountry) || !/^\+\d{1,4}$/.test(profile.phoneDialCode)) {
    throw validationError("Respondent phone country is invalid");
  }
  if (!/^[a-z]{2}$/.test(profile.country)) {
    throw validationError("Respondent country is invalid");
  }
  if (!VALID_RELATIONSHIPS.has(profile.relationship)) {
    throw validationError("Respondent relationship is invalid");
  }
  if (profile.relationship === "other" && (!profile.relationshipOther || profile.relationshipOther.length > 120)) {
    throw validationError("Respondent relationship detail is invalid");
  }
  if (!VALID_GENERATIONS.has(profile.generation)) {
    throw validationError("Respondent generation is invalid");
  }

  if (body.mode !== "full") {
    throw validationError("Assessment mode is invalid");
  }
  if (!isValidIsoDate(body.createdAt) || !isValidIsoDate(body.finalizedAt)) {
    throw validationError("Assessment timestamps are invalid");
  }
  if (Date.parse(body.finalizedAt) < Date.parse(body.createdAt)) {
    throw validationError("Assessment timestamps are out of order");
  }
  if (!isValidOpaqueId(body.groupId) || !isValidOpaqueId(body.participantId)) {
    throw validationError("Assessment identifiers are invalid");
  }

  const answerError = answerValidationMessage(body);
  if (answerError) throw validationError(answerError);

  const consent = body.privacyConsent ?? {};
  if (
    consent.accepted !== true ||
    consent.policyVersion !== PRIVACY_POLICY_VERSION ||
    !isValidIsoDate(consent.acceptedAt)
  ) {
    throw validationError("Current privacy consent is required");
  }
  if (Date.parse(consent.acceptedAt) > Date.parse(body.finalizedAt)) {
    throw validationError("Privacy consent timestamp is invalid");
  }

  const reportRequest = body.reportRequest ?? {};
  if (
    reportRequest.type !== "summary" ||
    reportRequest.status !== "requested" ||
    reportRequest.language !== body.language ||
    !isValidIsoDate(reportRequest.requestedAt)
  ) {
    throw validationError("Summary report request is invalid");
  }
  if (normalizeEmailAddress(reportRequest.recipientEmail) !== normalizeEmailAddress(profile.email)) {
    throw validationError("Summary report recipient must match the respondent email");
  }

  return body;
}
