import {
  normalizeAssessmentSubmission,
  validateAssessmentSubmission
} from "./scoring.js";
import {
  isValidOpaqueId,
  normalizeEmailAddress,
  validationError
} from "./validation.js";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";
export const MAX_GROUP_PARTICIPANTS = 3;

const TABLES = {
  respondents: {
    id: "AIRTABLE_RESPONDENTS_TABLE_ID",
    name: "AIRTABLE_RESPONDENTS_TABLE",
    fallback: "Respondents"
  },
  sessions: {
    id: "AIRTABLE_SESSIONS_TABLE_ID",
    name: "AIRTABLE_SESSIONS_TABLE",
    fallback: "Assessment Sessions"
  },
  groups: {
    id: "AIRTABLE_GROUPS_TABLE_ID",
    name: "AIRTABLE_GROUPS_TABLE",
    fallback: "Comparison Groups"
  },
  answers: {
    id: "AIRTABLE_ANSWERS_TABLE_ID",
    name: "AIRTABLE_ANSWERS_TABLE",
    fallback: "Assessment Answers"
  }
};

const DIMENSION_BY_PILLAR = {
  vision: "Family Identity and Purpose",
  constitution: "Family Roles and Participation",
  "family-governance": "Family Governance Bodies",
  ownership: "Ownership Governance",
  board: "Business Governance Board",
  management: "Family Decision-Making",
  "next-generation": "Next Generation Development",
  harmony: "Succession and Continuity"
};

const PILLAR_ORDER = [
  "vision",
  "constitution",
  "family-governance",
  "ownership",
  "board",
  "management",
  "next-generation",
  "harmony"
];

const RELATIONSHIP_BY_ID = {
  founder: "Founder",
  "family-working": "Family member working in business",
  "family-not-working": "Family member not working in business",
  "shareholder-non-family": "Shareholder non-family",
  "spouse-partner": "Spouse or partner",
  other: "Other"
};

const GENERATION_BY_ID = {
  first: "First generation founder",
  second: "Second generation",
  "third-plus": "Third generation or later"
};

function getConfig() {
  const token = process.env.AIRTABLE_API_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return null;
  }

  return { token, baseId };
}

function getTable(key) {
  const table = TABLES[key];
  return process.env[table.id] || process.env[table.name] || table.fallback;
}

function encodeTableName(table) {
  return encodeURIComponent(table).replace(/%20/g, "%20");
}

async function airtableRequest(path, options = {}) {
  const config = getConfig();

  if (!config) {
    return { skipped: true, reason: "missing-airtable-config" };
  }

  const response = await fetch(`${AIRTABLE_API_URL}/${config.baseId}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.error?.message || data?.error || "Airtable request failed";
    throw new Error(message);
  }

  return data;
}

export function escapeFormulaValue(value = "") {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function findRecordsByFormula(tableKey, formula, maxRecords = 100) {
  const table = encodeTableName(getTable(tableKey));
  const params = new URLSearchParams({
    maxRecords: String(maxRecords),
    filterByFormula: formula
  });
  const data = await airtableRequest(`${table}?${params.toString()}`);
  return data.records ?? [];
}

async function findRecordByFormula(tableKey, formula) {
  const records = await findRecordsByFormula(tableKey, formula, 1);
  return records[0] ?? null;
}

async function createRecord(tableKey, fields) {
  const table = encodeTableName(getTable(tableKey));
  const data = await airtableRequest(table, {
    method: "POST",
    body: JSON.stringify({ fields })
  });
  return data;
}

async function updateRecord(tableKey, recordId, fields) {
  const table = encodeTableName(getTable(tableKey));
  const data = await airtableRequest(`${table}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields })
  });
  return data;
}

async function upsertByFormula(tableKey, formula, fields) {
  const existingRecords = await findRecordsByFormula(tableKey, formula);
  const existing = existingRecords[0] ?? null;
  if (existing) {
    return updateRecord(tableKey, existing.id, fields);
  }
  return createRecord(tableKey, fields);
}

function selectLanguage(language) {
  return language === "es" ? "Spanish" : "English";
}

function formatDateTimeForAirtable(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function sessionKeyFor(body) {
  return `assessment-${body.participantId}`;
}

function normalizedEmail(body) {
  return normalizeEmailAddress(body.profile?.email);
}

function getPriorityDimensions(pillarScores = []) {
  return [...pillarScores]
    .filter((item) => Number.isFinite(item.score) && item.scored > 0 && item.score < 80)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => DIMENSION_BY_PILLAR[item.id])
    .filter(Boolean);
}

function getMaturityStage(body) {
  const stage = body.result?.stage ?? {};
  const label = stage.labels?.[body.language] || stage.id || body.stageId || "";
  const level = stage.level?.[body.language] || "";
  return [level, label].filter(Boolean).join(" - ");
}

function safeJson(value) {
  return JSON.stringify(value ?? null);
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function respondentFields(body, now, assessmentKey = "") {
  const profile = body.profile ?? {};
  const notes = assessmentKey ? `Assessment key: ${assessmentKey}` : "";

  return {
    "Respondent Name": profile.name || "",
    Email: normalizedEmail(body),
    Phone: profile.phoneInternational || profile.phoneNumber || "",
    "Phone Country": profile.phoneCountryLabel || profile.phoneDialCode || "",
    Country: profile.countryLabel || profile.country || "",
    Relationship: RELATIONSHIP_BY_ID[profile.relationship] || "Other",
    "Relationship Other": profile.relationshipOther || "",
    Generation: GENERATION_BY_ID[profile.generation] || "",
    Language: selectLanguage(body.language),
    "Lead Status": "Completed",
    "Consent Accepted": "Yes",
    Source: "Website Self-Assessment",
    "Created At": formatDateTimeForAirtable(body.createdAt || now),
    "Last Assessment At": formatDateTimeForAirtable(now),
    Notes: notes
  };
}

async function upsertRespondent(body, now, sessionKey) {
  const email = normalizedEmail(body);
  if (!email) return null;

  const assessmentKey = sessionKey || sessionKeyFor(body);
  const fields = respondentFields(body, now, assessmentKey);
  return upsertByFormula(
    "respondents",
    `{Notes} = '${escapeFormulaValue(fields.Notes)}'`,
    fields
  );
}

function sessionFields(body, sessionKey, now) {
  const result = body.result ?? {
    overall: body.overall,
    stage: { id: body.stageId },
    pillarScores: body.pillarScores,
    transparency: body.transparency
  };
  const pillarScores = result.pillarScores ?? body.pillarScores ?? [];

  return {
    "Session Key": sessionKey,
    "Respondent Email": body.profile?.email || "",
    "Respondent Name": body.profile?.name || "",
    Mode: body.mode || "full",
    Language: selectLanguage(body.language),
    Status: "Completed",
    "Overall Score": Number(result.overall ?? body.overall ?? 0),
    "Maturity Stage": getMaturityStage({ ...body, result }),
    "Priority Dimensions": getPriorityDimensions(pillarScores),
    "Unknown Responses": Number(result.transparency?.unknownCount ?? body.transparency?.unknownCount ?? 0),
    "Dimension Scores JSON": safeJson(pillarScores),
    "Profile JSON": safeJson(body.profile),
    "Started At": formatDateTimeForAirtable(body.createdAt || now),
    "Completed At": formatDateTimeForAirtable(body.createdAt || now),
    "Group Key": body.groupId || "",
    "Participant ID": body.participantId || "",
    "Finalized At": formatDateTimeForAirtable(body.finalizedAt || now),
    "Raw Result JSON": safeJson({ ...body, result })
  };
}

export async function getGroupParticipantCount(groupId) {
  if (!isValidOpaqueId(groupId)) {
    throw validationError("Comparison group key is invalid");
  }
  const records = await findRecordsByFormula(
    "sessions",
    `{Group Key} = '${escapeFormulaValue(groupId)}'`
  );
  const emails = new Set(
    records.map((record) => record.fields?.["Respondent Email"]?.toLowerCase()).filter(Boolean)
  );
  return emails.size;
}

function groupFields(body, now, existingRecord, participantCount) {
  const existing = existingRecord?.fields ?? {};
  const createdByEmail = existing["Created By Email"] || body.profile?.email || "";
  const createdByName = existing["Created By Name"] || body.profile?.name || "";
  const effectiveParticipantCount = Math.min(MAX_GROUP_PARTICIPANTS, participantCount);

  return {
    "Group Key": body.groupId,
    "Created By Email": createdByEmail,
    "Created By Name": createdByName,
    "Participant Count": effectiveParticipantCount,
    Status: effectiveParticipantCount >= 2 ? "Ready for Comparison" : "Waiting for Participants",
    "Invite Link": "",
    "Created At": existing["Created At"] || formatDateTimeForAirtable(body.createdAt || now),
    Notes: "Participant details are retained in assessment sessions and are not exposed publicly."
  };
}

function answerFields(body, sessionKey, now) {
  const answers = body.answers ?? {};
  const fields = {
    "Answer Key": sessionKey,
    "Session Key": sessionKey,
    "Respondent Email": body.profile?.email || "",
    Language: selectLanguage(body.language),
    "Submitted At": formatDateTimeForAirtable(now)
  };

  Object.entries(answers)
    .sort(([firstId], [secondId]) => getQuestionOrder(firstId) - getQuestionOrder(secondId))
    .forEach(([questionId, answer], index) => {
      const number = String(index + 1).padStart(2, "0");
      fields[`Q${number}`] = `${questionId}: ${answer}`;
    });

  return fields;
}

function getQuestionOrder(questionId) {
  const match = questionId.match(/full-(.*)-(\d+)$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const pillarIndex = PILLAR_ORDER.indexOf(match[1]);
  const questionNumber = Number(match[2]);
  return (pillarIndex < 0 ? 99 : pillarIndex) * 100 + questionNumber;
}

export async function persistAssessmentToAirtable(body) {
  const normalizedSubmission = normalizeAssessmentSubmission(body);
  validateAssessmentSubmission(normalizedSubmission);

  if (!getConfig()) {
    throw new Error("Missing Airtable configuration");
  }

  const normalizedBody = normalizedSubmission;
  const now = new Date().toISOString();
  const sessionKey = sessionKeyFor(normalizedBody);

  const existingSession = await findRecordByFormula(
    "sessions",
    `{Session Key} = '${escapeFormulaValue(sessionKey)}'`
  );
  const existingSessionFields = existingSession?.fields ?? {};
  if (
    existingSession &&
    (String(existingSessionFields["Group Key"] || "") !== normalizedBody.groupId ||
      normalizeEmailAddress(existingSessionFields["Respondent Email"]) !== normalizedEmail(normalizedBody))
  ) {
    throw validationError("Assessment participant identifier is already in use");
  }

  const groupSessionRecords = await findRecordsByFormula(
    "sessions",
    `{Group Key} = '${escapeFormulaValue(normalizedBody.groupId)}'`
  );
  const participantConflict = groupSessionRecords.some((record) => {
    const fields = record.fields ?? {};
    return (
      fields["Participant ID"] === normalizedBody.participantId &&
      normalizeEmailAddress(fields["Respondent Email"]) !== normalizedEmail(normalizedBody)
    );
  });
  if (participantConflict) {
    throw validationError("Assessment participant identifier is already in use");
  }

  const duplicateEmail = groupSessionRecords.some((record) => {
    const fields = record.fields ?? {};
    return (
      normalizeEmailAddress(fields["Respondent Email"]) === normalizedEmail(normalizedBody) &&
      fields["Participant ID"] !== normalizedBody.participantId
    );
  });
  if (duplicateEmail) {
    throw validationError("This email has already submitted to the comparison group");
  }

  const participantEmails = new Set(
    groupSessionRecords
      .map((record) => normalizeEmailAddress(record.fields?.["Respondent Email"]))
      .filter(Boolean)
  );
  if (!existingSession && participantEmails.size >= MAX_GROUP_PARTICIPANTS) {
    throw validationError("This comparison group is already full");
  }

  await upsertRespondent(normalizedBody, now, sessionKey);

  await upsertByFormula(
    "sessions",
    `{Session Key} = '${escapeFormulaValue(sessionKey)}'`,
    sessionFields(normalizedBody, sessionKey, now)
  );

  const existingGroup = await findRecordByFormula(
    "groups",
    `{Group Key} = '${escapeFormulaValue(normalizedBody.groupId)}'`
  );
  const participantCount = Math.min(
    MAX_GROUP_PARTICIPANTS,
    participantEmails.size + (existingSession || participantEmails.has(normalizedEmail(normalizedBody)) ? 0 : 1)
  );
  await upsertByFormula(
    "groups",
    `{Group Key} = '${escapeFormulaValue(normalizedBody.groupId)}'`,
    groupFields(normalizedBody, now, existingGroup, participantCount)
  );

  await upsertByFormula(
    "answers",
    `{Session Key} = '${escapeFormulaValue(sessionKey)}'`,
    answerFields(normalizedBody, sessionKey, now)
  );

  return {
    ok: true,
    persistence: "airtable",
    result: normalizedBody.result,
    groupStatus: {
      participantCount,
      maxParticipants: MAX_GROUP_PARTICIPANTS,
      isComplete: participantCount >= MAX_GROUP_PARTICIPANTS
    },
    isNewSubmission: !existingSession
  };
}

export async function getComparisonGroupFromAirtable(groupId) {
  if (!getConfig()) {
    throw new Error("Missing Airtable configuration");
  }

  const groupKey = String(groupId ?? "").trim();
  if (!isValidOpaqueId(groupKey)) {
    throw validationError("Comparison group key is invalid");
  }

  const groupRecord = await findRecordByFormula(
    "groups",
    `{Group Key} = '${escapeFormulaValue(groupKey)}'`
  );
  const sessionRecords = await findRecordsByFormula(
    "sessions",
    `{Group Key} = '${escapeFormulaValue(groupKey)}'`,
    100
  );

  const participants = sessionRecords
    .map((record, index) => {
      const fields = record.fields ?? {};
      const raw = parseJson(fields["Raw Result JSON"], {});
      const result = raw.result ?? {};
      const profile = raw.profile ?? parseJson(fields["Profile JSON"], {});
      const pillarScores = result.pillarScores ?? parseJson(fields["Dimension Scores JSON"], []);
      const overallScore = Number(result.overall ?? fields["Overall Score"]);

      if (!Number.isFinite(overallScore)) return null;

      return {
        id: fields["Participant ID"] || record.id,
        language: raw.language || (fields.Language === "Spanish" ? "es" : "en"),
        role: profile.relationship,
        generation: profile.generation,
        country: profile.country,
        completedAt: raw.createdAt || fields["Completed At"] || new Date().toISOString(),
        answers: raw.answers ?? {},
        result: {
          overall: overallScore,
          stageId: result.stage?.id || raw.stageId || "",
          pillarScores,
          transparency: result.transparency ?? raw.transparency ?? { unknownCount: 0 }
        },
        sortIndex: index
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    id: groupKey,
    maxParticipants: 3,
    createdAt: new Date().toISOString(),
    invitations: [],
    participants
  };
}
