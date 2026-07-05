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

function hasFiniteScore(value) {
  return value !== null && value !== "" && Number.isFinite(Number(value));
}

function stageLabel(stage) {
  if (!stage) return "Self-assessment summary";
  if (typeof stage === "string") return STAGE_LABELS[stage] || stage;
  return stage.label || stage.title || STAGE_LABELS[stage.id] || stage.id || "Self-assessment summary";
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
      score: hasFiniteScore(pillar.score) ? Math.round(Number(pillar.score)) : null,
      unknown: Math.round(safeNumber(pillar.unknown))
    }))
    .filter((pillar) => pillar.label && hasFiniteScore(pillar.score));
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

export function encodeActionToken(payload) {
  return encodeSummaryReportPayload(payload);
}

export function decodeActionToken(value = "") {
  return decodeSummaryReportPayload(value);
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
      contactRequested: Boolean(body.reportRequest?.contactRequested),
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
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 46;
  const forest = "#1c3d2e";
  const copper = "#c46f3a";
  const parchment = "#f6f0e7";
  const mist = "#e9dfd2";
  const muted = "#6f726d";
  const ink = "#3f433f";
  const softForest = "#eaf0eb";

  function pageBackground() {
    doc.setFillColor(parchment);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }

  function footer(pageLabel) {
    doc.setDrawColor("#ded4c6");
    doc.line(margin, pageHeight - 46, pageWidth - margin, pageHeight - 46);
    doc.setTextColor(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Confidential summary. This is not a grade, legal advice, or a substitute for a facilitated family governance process.", margin, pageHeight - 29);
    doc.text(pageLabel, pageWidth - margin, pageHeight - 29, { align: "right" });
  }

  function sectionLabel(text, x, y) {
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(text).toUpperCase(), x, y);
  }

  function drawMetricCard(x, y, width, height, label, value, detail, accent = forest) {
    doc.setFillColor("#ffffff");
    doc.roundedRect(x, y, width, height, 10, 10, "F");
    doc.setFillColor(accent);
    doc.roundedRect(x, y, 7, height, 4, 4, "F");
    sectionLabel(label, x + 20, y + 28);
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(39);
    doc.text(String(value), x + 20, y + 75);
    if (detail) {
      doc.setFontSize(10);
      doc.setTextColor(muted);
      wrapText(doc, detail, x + 20, y + 98, width - 40, 13);
    }
  }

  function drawListCard(x, y, width, height, title, items, accent) {
    doc.setFillColor("#ffffff");
    doc.roundedRect(x, y, width, height, 10, 10, "F");
    sectionLabel(title, x + 18, y + 28);
    let itemY = y + 52;
    const list = (items || []).slice(0, 3);

    if (!list.length) {
      doc.setTextColor(muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      wrapText(doc, "No items recorded.", x + 18, itemY, width - 36, 12);
      return;
    }

    for (const item of list) {
      doc.setFillColor(accent);
      doc.circle(x + 22, itemY + 3, 3, "F");
      doc.setTextColor(ink);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      itemY = wrapText(doc, item, x + 34, itemY, width - 52, 12) + 7;
    }
  }

  function drawScoreRow(pillar, x, y, width) {
    const score = Math.max(0, Math.min(100, safeNumber(pillar.score)));
    const barWidth = 190;
    const scoreColor = score < 60 ? copper : forest;

    doc.setFillColor("#ffffff");
    doc.roundedRect(x, y, width, 48, 9, 9, "F");
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    wrapText(doc, pillar.label, x + 18, y + 20, width - barWidth - 92, 12);
    doc.setFillColor(mist);
    doc.roundedRect(x + width - barWidth - 58, y + 21, barWidth, 8, 4, 4, "F");
    doc.setFillColor(scoreColor);
    doc.roundedRect(x + width - barWidth - 58, y + 21, Math.max(6, (score / 100) * barWidth), 8, 4, 4, "F");
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${Math.round(score)}/100`, x + width - 18, y + 28, { align: "right" });
  }

  pageBackground();
  doc.setFillColor(forest);
  doc.rect(0, 0, pageWidth, 246, "F");
  doc.setFillColor("#244b3b");
  doc.rect(0, 215, pageWidth, 31, "F");
  doc.setTextColor(copper);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("FAMILY ENTERPRISE SELF-ASSESSMENT", margin, 52);

  doc.setTextColor("#ffffff");
  doc.setFontSize(36);
  doc.text("Summary report", margin, 96);
  doc.setFontSize(18);
  doc.text(`for ${report.name || "Participant"}`, margin, 126);

  doc.setTextColor("#d8c7b2");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  wrapText(
    doc,
    "A concise conversation map showing the overall result, dimension scores, focus areas, and suggested next conversation.",
    margin,
    160,
    390,
    15
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.setFontSize(13);
  doc.text("Gilbert Devlyn", margin, 234);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#d8c7b2");
  doc.setFontSize(9);
  doc.text("Family Enterprise Advisory", margin + 100, 234);
  doc.text(`Generated ${formatDate(report.generatedAt)}`, pageWidth - margin, 234, { align: "right" });

  drawMetricCard(
    margin,
    284,
    178,
    135,
    "Overall score",
    `${Math.round(safeNumber(report.overall))}`,
    `${report.level || "Self-assessment summary"}`
  );

  const summaryX = margin + 198;
  const summaryWidth = pageWidth - margin * 2 - 198;
  doc.setFillColor("#ffffff");
  doc.roundedRect(summaryX, 284, summaryWidth, 135, 10, 10, "F");
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("What this suggests", summaryX + 22, 318);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  wrapText(doc, report.resultSummary, summaryX + 22, 344, summaryWidth - 44, 14);

  let y = 452;
  const colWidth = (pageWidth - margin * 2 - 16) / 2;
  drawListCard(margin, y, colWidth, 142, "Focus areas", report.focusAreas, copper);
  drawListCard(margin + colWidth + 16, y, colWidth, 142, "Relative strengths", report.strengths, forest);

  y += 172;
  doc.setFillColor(forest);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 92, 10, 10, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Suggested next conversation", margin + 20, y + 30);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#d8c7b2");
  doc.setFontSize(10);
  wrapText(
    doc,
    "Choose one priority conversation rather than trying to solve every governance topic at once. Gilbert can help turn these signals into a practical sequence of conversations and agreements.",
    margin + 20,
    y + 53,
    pageWidth - margin * 2 - 40,
    13
  );
  footer("Page 1 of 2");

  doc.addPage();
  pageBackground();
  sectionLabel("Scores by dimension", margin, 56);
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Dimension scores at a glance", margin, 88);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  wrapText(
    doc,
    "Each score is a signal for conversation. Lower scores are not failures; they simply point to topics that may need clearer agreements, better communication, or a more deliberate governance rhythm.",
    margin,
    118,
    pageWidth - margin * 2 - 70,
    14
  );

  y = 154;
  for (const pillar of (report.pillarScores || []).slice(0, 8)) {
    drawScoreRow(pillar, margin, y, pageWidth - margin * 2);
    y += 58;
  }

  doc.setFillColor(softForest);
  doc.roundedRect(margin, y + 6, pageWidth - margin * 2, 76, 10, 10, "F");
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("How to use this page", margin + 18, y + 31);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  wrapText(
    doc,
    "Use the dimension scores to choose one conversation to begin with. The strongest report is not the one with the highest score; it is the one that helps the family decide what to discuss next.",
    margin + 18,
    y + 51,
    pageWidth - margin * 2 - 36,
    12
  );
  footer("Page 2 of 2");

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
  const mist = "#e9dfd2";
  const softForest = "#eaf0eb";
  const muted = "#6f726d";
  const ink = "#3f433f";
  const bottomContentLimit = pageHeight - 82;
  let y = 0;

  function pageHeader(title) {
    doc.setFillColor(parchment);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(forest);
    doc.rect(0, 0, pageWidth, 92, "F");
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("GILBERT DEVLYN ADVISOR REPORT", margin, 38);
    doc.setTextColor("#ffffff");
    doc.setFontSize(22);
    doc.text(title, margin, 68);
    doc.setTextColor("#d8c7b2");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Confidential internal follow-up notes", pageWidth - margin, 38, { align: "right" });
    y = 120;
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

  doc.setFillColor("#ffffff");
  doc.roundedRect(margin, y, pageWidth - margin * 2, 128, 10, 10, "F");
  doc.setFillColor(copper);
  doc.roundedRect(margin, y, 8, 128, 4, 4, "F");
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(participantName, margin + 24, y + 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(ink);
  doc.text(report.participant?.email || "No email provided", margin + 24, y + 62);
  doc.setTextColor(muted);
  doc.text(`Requested ${report.timing?.requestedAt || "Not provided"}`, margin + 24, y + 85);
  const scoreCardWidth = 148;
  doc.setFillColor(softForest);
  doc.roundedRect(pageWidth - margin - scoreCardWidth - 20, y + 20, scoreCardWidth, 88, 8, 8, "F");
  doc.setTextColor(copper);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("OVERALL SCORE", pageWidth - margin - scoreCardWidth - 4, y + 42);
  doc.setTextColor(forest);
  doc.setFontSize(32);
  doc.text(String(report.overall ?? 0), pageWidth - margin - scoreCardWidth - 4, y + 78);
  doc.setFontSize(11);
  doc.text("/100", pageWidth - margin - 72, y + 78);
  doc.setFontSize(9);
  doc.setTextColor(muted);
  doc.text(report.level || "Self-assessment summary", pageWidth - margin - 94, y + 98, { align: "center" });
  y += 160;

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
  doc.roundedRect(margin, y, pageWidth - margin * 2, 128, 8, 8, "F");
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("What Gilbert should know first", margin + 18, y + 26);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  wrapText(doc, report.resultSummary, margin + 18, y + 48, pageWidth - margin * 2 - 36, 14);
  y += 156;

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
    const score = Math.max(0, Math.min(100, safeNumber(pillar.score)));
    doc.setFillColor("#ffffff");
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 6, 6, "F");
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(pillar.label, margin + 12, y + 20);
    doc.setFillColor(mist);
    doc.roundedRect(margin + 292, y + 14, 160, 7, 4, 4, "F");
    doc.setFillColor(score < 60 ? copper : forest);
    doc.roundedRect(margin + 292, y + 14, Math.max(4, (score / 100) * 160), 7, 4, 4, "F");
    doc.setTextColor(forest);
    doc.setFontSize(10);
    doc.text(`${Math.round(score)}/100`, pageWidth - margin - 12, y + 20, { align: "right" });
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
      "This appendix is for Gilbert's internal review. It includes the submitted answer for each self-assessment question so follow-up can be grounded in the respondent's actual inputs.",
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

      const questionLines = doc.splitTextToSize(String(row.question || ""), 318);
      const answerLines = doc.splitTextToSize(String(row.answerLabel || "No answer"), 118);
      const rowHeight = Math.max(58, Math.max(questionLines.length, answerLines.length) * 12 + 28);
      ensureSpace(rowHeight + 14);
      doc.setFillColor("#ffffff");
      const rowStart = y;
      doc.roundedRect(margin, rowStart, pageWidth - margin * 2, rowHeight, 6, 6, "F");
      doc.setFillColor(softForest);
      doc.roundedRect(margin + 10, rowStart + 11, 28, 20, 4, 4, "F");
      doc.setTextColor(forest);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`Q${row.number}`, margin + 24, rowStart + 25, { align: "center" });
      doc.setTextColor(ink);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(questionLines, margin + 50, rowStart + 20);
      doc.setTextColor(forest);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(answerLines, pageWidth - margin - 130, rowStart + 20);
      y += rowHeight + 12;
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
