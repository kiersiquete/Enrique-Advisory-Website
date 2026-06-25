import { jsPDF } from "jspdf";
import { FULL_QUESTIONS } from "../src/data/assessment.js";

const STAGE_LABELS = {
  emerging: "Level 1 - Emerging",
  developing: "Level 2 - Developing",
  established: "Level 3 - Established",
  strength: "Level 4 - Strength"
};

const PILLAR_LABELS = {
  vision: "Family Vision, Values & Purpose",
  constitution: "Family Constitution / Protocol",
  protocol: "Family Constitution / Protocol",
  "family-governance": "Family Governance Bodies",
  "family-bodies": "Family Governance Bodies",
  familyBodies: "Family Governance Bodies",
  ownership: "Ownership Governance",
  board: "Business Governance (Board)",
  management: "Management & Professionalization",
  "next-generation": "Next Generation Development",
  "next-gen": "Next Generation Development",
  nextGen: "Next Generation Development",
  harmony: "Family Harmony, Conflict & Legacy"
};

const PILLAR_ORDER = [
  "vision",
  "constitution",
  "protocol",
  "family-governance",
  "family-bodies",
  "ownership",
  "board",
  "management",
  "next-generation",
  "next-gen",
  "harmony"
];

const ANSWER_LABELS = {
  0: "0 - Not true for us",
  1: "1 - Rarely true",
  2: "2 - Sometimes true",
  3: "3 - Often true",
  4: "4 - Mostly true",
  5: "5 - Very true for us",
  unknown: "Not sure / I don't know"
};

const QUESTION_LOOKUP = Object.values(FULL_QUESTIONS)
  .flat()
  .reduce((lookup, question) => {
    lookup.set(question.id, question);
    return lookup;
  }, new Map());

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stageLabel(stage) {
  if (!stage) return "Diagnostic summary";
  if (typeof stage === "string") return STAGE_LABELS[stage] || stage;
  return stage.label || stage.title || STAGE_LABELS[stage.id] || stage.id || "Diagnostic summary";
}

function pillarLabel(pillar) {
  return pillar.label || pillar.title || PILLAR_LABELS[pillar.id] || pillar.id || "Dimension";
}

function scoreLine(item) {
  return `${item.label}: ${Math.round(item.score)}/100`;
}

function answerLabel(value) {
  if (value === "unknown") return ANSWER_LABELS.unknown;
  const number = Number(value);
  return ANSWER_LABELS[number] || String(value ?? "No answer");
}

function readableDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function buildAnswerRows(body = {}) {
  return Object.entries(body.answers ?? {})
    .map(([questionId, answer]) => {
      const question = QUESTION_LOOKUP.get(questionId);
      return {
        id: questionId,
        pillarId: question?.pillarId || questionId.match(/full-(.*)-\d+$/)?.[1] || "",
        pillar: PILLAR_LABELS[question?.pillarId] || PILLAR_LABELS[questionId.match(/full-(.*)-\d+$/)?.[1]] || "Dimension",
        number: question?.number || Number(questionId.match(/-(\d+)$/)?.[1] || 0),
        question: question?.text || questionId,
        answer,
        answerLabel: answerLabel(answer)
      };
    })
    .sort((a, b) => {
      const firstPillarIndex = PILLAR_ORDER.includes(a.pillarId) ? PILLAR_ORDER.indexOf(a.pillarId) : 999;
      const secondPillarIndex = PILLAR_ORDER.includes(b.pillarId) ? PILLAR_ORDER.indexOf(b.pillarId) : 999;
      const pillarDiff = firstPillarIndex - secondPillarIndex;
      if (pillarDiff !== 0) return pillarDiff;
      return a.number - b.number;
    });
}

export function buildSummaryReportPayload(body = {}, savedResult = {}) {
  const profile = body.profile ?? {};
  const result = body.result ?? {};
  const overall = Math.round(safeNumber(result.overall ?? body.overall));
  const pillarScores = (result.pillarScores ?? [])
    .map((pillar) => ({
      id: pillar.id,
      label: pillarLabel(pillar),
      score: Math.round(safeNumber(pillar.score)),
      unknown: Math.round(safeNumber(pillar.unknown))
    }))
    .filter((pillar) => pillar.label && Number.isFinite(pillar.score));
  const sortedByScore = [...pillarScores].sort((a, b) => a.score - b.score);

  return {
    name: profile.name || "there",
    email: profile.email || body.reportRequest?.recipientEmail || "",
    language: body.language || "en",
    generatedAt: body.reportRequest?.requestedAt || body.finalizedAt || new Date().toISOString(),
    overall,
    level: stageLabel(result.stage),
    interpretation:
      "This summary is a starting point for reflection and conversation. It is not a grade or verdict, but a way to see where the family may have clarity, tension, or areas worth discussing further.",
    resultSummary:
      overall >= 75
        ? "The family appears to have strong governance foundations. The next work is maintaining performance as decisions become more complex."
        : overall >= 60
          ? "The family appears to have useful governance foundations already in place. The next work is strengthening how those structures perform when decisions become sensitive or complex."
          : "The family may benefit from clearer agreements, better visibility, and a more structured sequence of conversations.",
    pillarScores,
    focusAreas: sortedByScore.slice(0, 3).map(scoreLine),
    strengths: [...pillarScores].sort((a, b) => b.score - a.score).slice(0, 3).map(scoreLine),
    sessionKey: savedResult.sessionKey || ""
  };
}

export function encodeSummaryReportPayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeSummaryReportPayload(value = "") {
  return JSON.parse(Buffer.from(String(value), "base64url").toString("utf8"));
}

export function buildAdminReportPayload(body = {}, savedResult = {}) {
  const summary = buildSummaryReportPayload(body, savedResult);
  const profile = body.profile ?? {};
  const result = body.result ?? {};
  const hasInvitation = Boolean(body.inviteLink || body.inviteEmail);

  return {
    ...summary,
    participant: {
      name: profile.name || "Unknown",
      email: profile.email || body.reportRequest?.recipientEmail || "",
      phone: profile.phoneInternational || profile.phoneNumber || "",
      phoneCountry: profile.phoneCountryLabel || profile.phoneCountry || "",
      country: profile.countryLabel || profile.country || "",
      relationship: profile.relationshipLabel || profile.relationship || "",
      generation: profile.generationLabel || profile.generation || ""
    },
    timing: {
      startedAt: readableDateTime(body.createdAt),
      completedAt: readableDateTime(body.finalizedAt || body.createdAt),
      requestedAt: readableDateTime(body.reportRequest?.requestedAt || body.finalizedAt)
    },
    context: {
      language: body.language || "en",
      mode: body.mode || "full",
      groupId: body.groupId || "",
      participantId: body.participantId || "",
      inviteStatus: hasInvitation ? "Invitation created" : "No invitation created",
      inviteEmail: body.inviteEmail || "",
      inviteLink: body.inviteLink || "",
      sessionKey: savedResult.sessionKey || summary.sessionKey || ""
    },
    transparency: {
      unknownCount: Math.round(safeNumber(result.transparency?.unknownCount))
    },
    answerRows: buildAnswerRows(body)
  };
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function createSummaryPdfBuffer(payload) {
  const report = payload ?? {};
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const forest = "#1c3d2e";
  const copper = "#c46f3a";
  const parchment = "#f8f3ea";
  const muted = "#6f726d";
  const ink = "#3f433f";

  doc.setFillColor(forest);
  doc.rect(0, 0, pageWidth, 225, "F");
  doc.setTextColor(copper);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FAMILY ENTERPRISE DIAGNOSTIC", margin, 54);

  doc.setTextColor("#ffffff");
  doc.setFontSize(34);
  doc.text("Summary report", margin, 92);
  doc.setFontSize(20);
  doc.text(`for ${report.name || "Participant"}`, margin, 122);

  doc.setTextColor("#d8c7b2");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  wrapText(
    doc,
    "A concise conversation map showing the overall result, dimension scores, focus areas, and suggested next conversation.",
    margin,
    154,
    420,
    17
  );

  doc.setDrawColor("#476859");
  doc.line(margin, 185, pageWidth - margin, 185);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.setFontSize(15);
  doc.text("Gilbert Devlyn", margin, 207);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#d8c7b2");
  doc.setFontSize(10);
  doc.text("Family Enterprise Advisory", margin, 222);
  doc.text(`Generated ${formatDate(report.generatedAt)}`, pageWidth - margin, 207, { align: "right" });

  doc.setFillColor(parchment);
  doc.rect(0, 225, pageWidth, 567, "F");

  doc.setFillColor("#ffffff");
  doc.roundedRect(margin, 255, 170, 112, 8, 8, "F");
  doc.setTextColor(muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("OVERALL SCORE", margin + 18, 282);
  doc.setTextColor(forest);
  doc.setFontSize(42);
  doc.text(String(report.overall ?? 0), margin + 18, 326);
  doc.setFontSize(16);
  doc.setTextColor(muted);
  doc.text("/ 100", margin + 85, 326);
  doc.setTextColor(copper);
  doc.setFontSize(10);
  doc.text(String(report.level || "Diagnostic summary").toUpperCase(), margin + 18, 350);

  doc.setFillColor("#ffffff");
  doc.roundedRect(margin + 190, 255, pageWidth - margin * 2 - 190, 112, 8, 8, "F");
  doc.setTextColor(forest);
  doc.setFontSize(20);
  doc.text("What this suggests", margin + 210, 288);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  wrapText(doc, report.resultSummary, margin + 210, 312, 315, 15);

  let y = 405;
  doc.setTextColor(copper);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SCORES BY DIMENSION", margin, y);
  y += 22;

  for (const pillar of (report.pillarScores || []).slice(0, 8)) {
    doc.setFillColor("#ffffff");
    doc.roundedRect(margin, y, pageWidth - margin * 2, 38, 6, 6, "F");
    doc.setTextColor(forest);
    doc.setFontSize(10);
    doc.text(pillar.label, margin + 14, y + 16);
    doc.setFillColor("#ece8df");
    doc.roundedRect(margin + 280, y + 14, 200, 7, 4, 4, "F");
    doc.setFillColor(pillar.score < 60 ? copper : forest);
    doc.roundedRect(margin + 280, y + 14, Math.max(4, pillar.score * 2), 7, 4, 4, "F");
    doc.setTextColor(forest);
    doc.setFontSize(11);
    doc.text(`${pillar.score}/100`, pageWidth - margin - 14, y + 18, { align: "right" });
    y += 46;
  }

  y += 10;
  const colWidth = (pageWidth - margin * 2 - 16) / 2;
  doc.setFillColor("#ffffff");
  doc.roundedRect(margin, y, colWidth, 118, 8, 8, "F");
  doc.roundedRect(margin + colWidth + 16, y, colWidth, 118, 8, 8, "F");

  doc.setTextColor(copper);
  doc.setFontSize(10);
  doc.text("FOCUS AREAS", margin + 16, y + 24);
  doc.text("RELATIVE STRENGTHS", margin + colWidth + 32, y + 24);

  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let leftY = y + 46;
  for (const item of (report.focusAreas || []).slice(0, 3)) {
    leftY = wrapText(doc, `- ${item}`, margin + 16, leftY, colWidth - 32, 13) + 3;
  }
  let rightY = y + 46;
  for (const item of (report.strengths || []).slice(0, 3)) {
    rightY = wrapText(doc, `- ${item}`, margin + colWidth + 32, rightY, colWidth - 32, 13) + 3;
  }

  y += 145;
  doc.setFillColor(forest);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 82, 8, 8, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Suggested next conversation", margin + 18, y + 28);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#d8c7b2");
  doc.setFontSize(10);
  wrapText(
    doc,
    "Choose one priority conversation rather than trying to solve every governance topic at once. Gilbert can help turn these signals into a practical sequence of conversations and agreements.",
    margin + 18,
    y + 50,
    pageWidth - margin * 2 - 36,
    13
  );

  doc.setTextColor(muted);
  doc.setFontSize(8);
  wrapText(
    doc,
    "Confidential summary. This is not a grade, legal advice, or a substitute for a facilitated family governance process.",
    margin,
    762,
    pageWidth - margin * 2,
    10
  );

  return Buffer.from(doc.output("arraybuffer"));
}

export function createAdminPdfBuffer(payload) {
  const report = payload ?? {};
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 46;
  const forest = "#1c3d2e";
  const copper = "#c46f3a";
  const parchment = "#f8f3ea";
  const muted = "#6f726d";
  const ink = "#3f433f";
  const bottomContentLimit = pageHeight - 82;
  let y = 0;

  function pageHeader(title) {
    doc.setFillColor(parchment);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("GILBERT DEVLYN ADVISOR REPORT", margin, 38);
    doc.setTextColor(forest);
    doc.setFontSize(22);
    doc.text(title, margin, 68);
    doc.setDrawColor("#ded8cf");
    doc.line(margin, 82, pageWidth - margin, 82);
    y = 110;
  }

  function ensureSpace(height) {
    if (y + height <= bottomContentLimit) return;
    doc.addPage();
    pageHeader("Advisor report");
  }

  function labelValue(label, value, x, valueY, width) {
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(String(label).toUpperCase(), x, valueY);
    doc.setTextColor(ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    return wrapText(doc, value || "Not provided", x, valueY + 16, width, 13);
  }

  function sectionTitle(title) {
    ensureSpace(34);
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(title).toUpperCase(), margin, y);
    y += 22;
  }

  function listItem(text, x, itemY, width, color = forest) {
    doc.setFillColor(color);
    doc.circle(x + 4, itemY + 3, 3, "F");
    doc.setTextColor(ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    return wrapText(doc, text || "Not provided", x + 14, itemY, width - 14, 12);
  }

  const participantName = report.participant?.name || report.name || "Participant";
  pageHeader(`${participantName} just finished assessment`);

  doc.setFillColor(forest);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 122, 8, 8, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text(participantName, margin + 20, y + 34);
  doc.setFontSize(13);
  doc.setTextColor("#d8c7b2");
  doc.text(report.participant?.email || "No email provided", margin + 20, y + 58);
  doc.setTextColor("#ffffff");
  doc.setFontSize(36);
  doc.text(String(report.overall ?? 0), pageWidth - margin - 118, y + 56);
  doc.setFontSize(13);
  doc.setTextColor("#d8c7b2");
  doc.text("/100", pageWidth - margin - 60, y + 56);
  doc.setFontSize(11);
  doc.text(report.level || "Diagnostic summary", pageWidth - margin - 20, y + 86, { align: "right" });
  y += 154;

  sectionTitle("Contact and context");
  const cardY = y;
  doc.setFillColor("#ffffff");
  doc.roundedRect(margin, cardY, pageWidth - margin * 2, 212, 8, 8, "F");
  const col = (pageWidth - margin * 2 - 48) / 3;
  labelValue("Phone", report.participant?.phone, margin + 18, cardY + 26, col);
  labelValue("Country", report.participant?.country, margin + 18 + col + 18, cardY + 26, col);
  labelValue("Relationship", report.participant?.relationship, margin + 18 + (col + 18) * 2, cardY + 26, col);
  labelValue("Generation", report.participant?.generation, margin + 18, cardY + 88, col);
  labelValue("Started", report.timing?.startedAt, margin + 18 + col + 18, cardY + 88, col);
  labelValue("Requested", report.timing?.requestedAt, margin + 18 + (col + 18) * 2, cardY + 88, col);
  labelValue("Invitation status", report.context?.inviteStatus, margin + 18, cardY + 150, col);
  labelValue("Invited email", report.context?.inviteEmail, margin + 18 + col + 18, cardY + 150, col);
  labelValue("Group key", report.context?.groupId, margin + 18 + (col + 18) * 2, cardY + 150, col);
  y = cardY + 240;

  ensureSpace(168);
  sectionTitle("Summary explanation");
  doc.setFillColor("#ffffff");
  doc.roundedRect(margin, y, pageWidth - margin * 2, 118, 8, 8, "F");
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("What Gilbert should know first", margin + 18, y + 26);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  wrapText(doc, report.resultSummary, margin + 18, y + 48, pageWidth - margin * 2 - 36, 14);
  y += 146;

  ensureSpace(168);
  sectionTitle("Priority areas");
  const listY = y;
  doc.setFillColor("#ffffff");
  doc.roundedRect(margin, listY, pageWidth - margin * 2, 124, 8, 8, "F");
  doc.setTextColor(copper);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PRIORITY AREAS", margin + 18, listY + 26);
  doc.setTextColor(copper);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("RELATIVE STRENGTHS", margin + 300, listY + 26);

  let leftY = listY + 50;
  const focusItems = (report.focusAreas || []).slice(0, 3);
  if (focusItems.length) {
    for (const item of focusItems) {
      leftY = listItem(item, margin + 18, leftY, 230, copper) + 5;
    }
  } else {
    leftY = listItem("No priority areas recorded.", margin + 18, leftY, 230, muted) + 5;
  }

  let rightY = listY + 48;
  const strengthItems = (report.strengths || []).slice(0, 3);
  if (strengthItems.length) {
    for (const item of strengthItems) {
      rightY = listItem(item, margin + 300, rightY, 225, forest) + 5;
    }
  } else {
    rightY = listItem("No relative strengths recorded.", margin + 300, rightY, 225, muted) + 5;
  }
  y = listY + 152;

  sectionTitle("Scores by dimension");
  for (const pillar of report.pillarScores || []) {
    ensureSpace(44);
    doc.setFillColor("#ffffff");
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 6, 6, "F");
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(pillar.label, margin + 12, y + 20);
    doc.setFillColor("#ece8df");
    doc.roundedRect(margin + 292, y + 14, 160, 7, 4, 4, "F");
    doc.setFillColor(pillar.score < 60 ? copper : forest);
    doc.roundedRect(margin + 292, y + 14, Math.max(4, pillar.score * 1.6), 7, 4, 4, "F");
    doc.setTextColor(forest);
    doc.setFontSize(10);
    doc.text(`${pillar.score}/100`, pageWidth - margin - 12, y + 20, { align: "right" });
    y += 42;
  }

  if ((report.answerRows || []).length) {
    doc.addPage();
    pageHeader("Question-by-question appendix");
    doc.setTextColor(ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = wrapText(
      doc,
      "This appendix is for Gilbert's internal review. It includes the submitted answer for each diagnostic question so follow-up can be grounded in the respondent's actual inputs.",
      margin,
      y,
      pageWidth - margin * 2,
      14
    ) + 22;

    let currentPillar = "";
    for (const row of report.answerRows || []) {
      if (row.pillar !== currentPillar) {
        ensureSpace(44);
        currentPillar = row.pillar;
        doc.setTextColor(copper);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(currentPillar.toUpperCase(), margin, y);
        y += 20;
      }

      ensureSpace(72);
      doc.setFillColor("#ffffff");
      const rowStart = y;
      doc.roundedRect(margin, rowStart, pageWidth - margin * 2, 58, 6, 6, "F");
      doc.setTextColor(forest);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`Q${row.number}`, margin + 12, rowStart + 18);
      doc.setTextColor(ink);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      wrapText(doc, row.question, margin + 44, rowStart + 18, 330, 12);
      doc.setTextColor(forest);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      wrapText(doc, row.answerLabel, pageWidth - margin - 130, rowStart + 18, 118, 12);
      y += 68;
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setTextColor(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 28, { align: "right" });
    doc.text("Confidential advisor report", margin, pageHeight - 28);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
