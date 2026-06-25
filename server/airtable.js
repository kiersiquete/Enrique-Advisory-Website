const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const MAX_GROUP_PARTICIPANTS = 3;

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

function escapeFormulaValue(value = "") {
  return String(value).replace(/'/g, "\\'");
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
    const updated = await updateRecord(tableKey, existing.id, fields);
    await deleteRecords(tableKey, existingRecords.slice(1));
    return updated;
  }
  return createRecord(tableKey, fields);
}

async function deleteRecords(tableKey, records) {
  if (records.length === 0) return [];

  const table = encodeTableName(getTable(tableKey));
  const deleted = [];

  for (let index = 0; index < records.length; index += 10) {
    const batch = records.slice(index, index + 10);
    const params = new URLSearchParams();
    batch.forEach((record) => params.append("records[]", record.id));
    const data = await airtableRequest(`${table}?${params.toString()}`, { method: "DELETE" });
    deleted.push(...(data.records ?? []));
  }

  return deleted;
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
  const email = body.profile?.email || "unknown-email";
  const createdAt = body.createdAt || new Date().toISOString();
  return `${email}|${createdAt}`;
}

function normalizedEmail(body) {
  return body.profile?.email?.trim().toLowerCase() || "";
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

function validationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

function validateAssessmentBody(body = {}) {
  if (!normalizedEmail(body)) {
    throw validationError("Respondent email is required");
  }

  if (!body.profile?.name?.trim()) {
    throw validationError("Respondent name is required");
  }

  if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
    throw validationError("Assessment answers are required");
  }

  if (Object.keys(body.answers).length === 0) {
    throw validationError("Assessment answers are required");
  }

  const result = body.result ?? {};
  if (!Number.isFinite(Number(result.overall ?? body.overall))) {
    throw validationError("Assessment result score is required");
  }

  const pillarScores = result.pillarScores ?? body.pillarScores;
  if (!Array.isArray(pillarScores) || pillarScores.length === 0) {
    throw validationError("Assessment pillar scores are required");
  }
}

function respondentFields(body, now) {
  const profile = body.profile ?? {};

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
    "Last Assessment At": formatDateTimeForAirtable(now)
  };
}

async function upsertRespondent(body, now) {
  const email = normalizedEmail(body);
  if (!email) return null;

  return createRecord("respondents", respondentFields(body, now));
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

async function getGroupParticipantCount(groupId) {
  if (!groupId) return 0;
  const records = await findRecordsByFormula(
    "sessions",
    `{Group Key} = '${escapeFormulaValue(groupId)}'`
  );
  const emails = new Set(
    records.map((record) => record.fields?.["Respondent Email"]?.toLowerCase()).filter(Boolean)
  );
  return emails.size;
}

async function groupFields(body, now, existingRecord) {
  const participantCount = await getGroupParticipantCount(body.groupId);
  const existing = existingRecord?.fields ?? {};
  const createdByEmail = existing["Created By Email"] || body.profile?.email || body.inviteEmail || "";
  const createdByName = existing["Created By Name"] || body.profile?.name || "";
  const inviteLink = body.inviteLink || existing["Invite Link"] || "";
  const providedParticipantCount = Number(body.groupParticipantCount);
  const effectiveParticipantCount = Math.min(
    MAX_GROUP_PARTICIPANTS,
    Math.max(
      participantCount,
      Number.isFinite(providedParticipantCount) ? providedParticipantCount : 1
    )
  );
  const notes = [
    `Creator: ${createdByName || "Unknown"} <${createdByEmail || "no email"}>`,
    `Latest participant: ${body.profile?.name || "Unknown"} <${body.profile?.email || "no email"}>`,
    inviteLink ? `Invite link: ${inviteLink}` : "",
    body.inviteEmail ? `Invited email: ${body.inviteEmail}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return {
    "Group Key": body.groupId,
    "Created By Email": createdByEmail,
    "Created By Name": createdByName,
    "Participant Count": effectiveParticipantCount,
    Status: effectiveParticipantCount >= 2 ? "Ready for Comparison" : "Waiting for Participants",
    "Invite Link": inviteLink,
    "Created At": existing["Created At"] || formatDateTimeForAirtable(body.createdAt || now),
    Notes: notes
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
  validateAssessmentBody(body);

  if (!getConfig()) {
    throw new Error("Missing Airtable configuration");
  }

  const normalizedBody = {
    ...body,
    groupId: String(body.groupId ?? "").trim()
  };
  const now = new Date().toISOString();
  const sessionKey = sessionKeyFor(normalizedBody);

  await upsertRespondent(normalizedBody, now);

  await upsertByFormula(
    "sessions",
    `{Session Key} = '${escapeFormulaValue(sessionKey)}'`,
    sessionFields(normalizedBody, sessionKey, now)
  );

  if (normalizedBody.groupId) {
    const existingGroup = await findRecordByFormula(
      "groups",
      `{Group Key} = '${escapeFormulaValue(normalizedBody.groupId)}'`
    );
    await upsertByFormula(
      "groups",
      `{Group Key} = '${escapeFormulaValue(normalizedBody.groupId)}'`,
      await groupFields(normalizedBody, now, existingGroup)
    );
  }

  await upsertByFormula(
    "answers",
    `{Session Key} = '${escapeFormulaValue(sessionKey)}'`,
    answerFields(normalizedBody, sessionKey, now)
  );

  const group = normalizedBody.groupId
    ? await getComparisonGroupFromAirtable(normalizedBody.groupId)
    : null;

  return { ok: true, persistence: "airtable", sessionKey, group };
}

export async function getComparisonGroupFromAirtable(groupId) {
  if (!getConfig()) {
    throw new Error("Missing Airtable configuration");
  }

  const groupKey = String(groupId ?? "").trim();
  if (!groupKey) {
    throw new Error("Missing group key");
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
