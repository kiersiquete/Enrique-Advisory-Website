import { jsPDF } from "jspdf";
import { FULL_QUESTIONS, PILLARS } from "../src/data/assessment.js";

const PILLARS_BY_ID = new Map(PILLARS.map((pillar) => [pillar.id, pillar]));

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

function stageLabel(stage, language = "en") {
  const fallback = language === "es" ? "Resumen de autoevaluación" : "Self-assessment summary";
  if (!stage) return fallback;
  if (typeof stage === "string") return STAGE_LABELS[stage] || stage;

  const level = stage.level?.[language] || stage.level?.en || "";
  const label = stage.labels?.[language] || stage.labels?.en || stage.label || stage.title || "";
  const localized = [level, label].filter(Boolean).join(" - ");

  return localized || STAGE_LABELS[stage.id] || stage.id || fallback;
}

function pillarLabel(pillar, language = "en") {
  const localized = PILLARS_BY_ID.get(pillar.id)?.labels?.[language];
  return localized || pillar.label || pillar.title || PILLAR_LABELS[pillar.id] || pillar.id || "Dimension";
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
  const language = body.language === "es" ? "es" : "en";
  const overall = Math.round(safeNumber(result.overall ?? body.overall));
  const pillarScores = (result.pillarScores ?? [])
    .map((pillar) => ({
      id: pillar.id,
      label: pillarLabel(pillar, language),
      score: hasFiniteScore(pillar.score) ? Math.round(Number(pillar.score)) : null,
      unknown: Math.round(safeNumber(pillar.unknown))
    }))
    .filter((pillar) => pillar.label && hasFiniteScore(pillar.score));
  const sortedByScore = [...pillarScores].sort((a, b) => a.score - b.score);

  const interpretation =
    language === "es"
      ? "Este resumen es un punto de partida para la reflexión y la conversación. No es una calificación ni un veredicto, sino una forma de ver dónde la familia puede tener claridad, tensión o temas que valga la pena conversar."
      : "This summary is a starting point for reflection and conversation. It is not a grade or verdict, but a way to see where the family may have clarity, tension, or areas worth discussing further.";

  const resultSummary =
    language === "es"
      ? overall >= 75
        ? "La familia parece tener bases sólidas de gobierno. El siguiente trabajo es mantener el desempeño a medida que las decisiones se vuelven más complejas."
        : overall >= 60
          ? "La familia parece tener bases de gobierno útiles ya establecidas. El siguiente trabajo es fortalecer cómo funcionan esas estructuras cuando las decisiones se vuelven sensibles o complejas."
          : "La familia podría beneficiarse de acuerdos más claros, mayor visibilidad y una secuencia más estructurada de conversaciones."
      : overall >= 75
        ? "The family appears to have strong governance foundations. The next work is maintaining performance as decisions become more complex."
        : overall >= 60
          ? "The family appears to have useful governance foundations already in place. The next work is strengthening how those structures perform when decisions become sensitive or complex."
          : "The family may benefit from clearer agreements, better visibility, and a more structured sequence of conversations.";

  return {
    name: profile.name || "there",
    email: profile.email || body.reportRequest?.recipientEmail || "",
    language,
    generatedAt: body.reportRequest?.requestedAt || body.finalizedAt || new Date().toISOString(),
    overall,
    level: stageLabel(result.stage, language),
    interpretation,
    resultSummary,
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

const COMPARISON_RELATIONSHIP_LABELS = {
  en: {
    founder: "Founder",
    "family-working": "Family member working in the business",
    "family-not-working": "Family member not working in the business",
    "shareholder-non-family": "Shareholder, non-family",
    "spouse-partner": "Spouse or partner",
    other: "Other"
  },
  es: {
    founder: "Fundador/a",
    "family-working": "Familiar que trabaja en la empresa",
    "family-not-working": "Familiar que no trabaja en la empresa",
    "shareholder-non-family": "Accionista no familiar",
    "spouse-partner": "Cónyuge o pareja",
    other: "Otro"
  }
};

const COMPARISON_GENERATION_LABELS = {
  en: {
    first: "First generation (founder)",
    second: "Second generation",
    "third-plus": "Third generation or later"
  },
  es: {
    first: "Primera generación (fundador/a)",
    second: "Segunda generación",
    "third-plus": "Tercera generación o posterior"
  }
};

function comparisonParticipantLabel(participant, index, language = "en") {
  const relationshipLabels = COMPARISON_RELATIONSHIP_LABELS[language] || COMPARISON_RELATIONSHIP_LABELS.en;
  const generationLabels = COMPARISON_GENERATION_LABELS[language] || COMPARISON_GENERATION_LABELS.en;
  const role = relationshipLabels[participant.role] || participant.role || (language === "es" ? "Participante" : "Participant");
  const generation = generationLabels[participant.generation] || participant.generation || "";
  return `P${index + 1}: ${[role, generation].filter(Boolean).join(" - ")}`;
}

export function buildComparisonReportPayload(group = {}, language = "en") {
  const participants = (group.participants ?? []).slice(0, 3);
  const participantSummaries = participants.map((participant, index) => ({
    id: participant.id,
    label: comparisonParticipantLabel(participant, index, language),
    country: participant.country || "",
    overall: hasFiniteScore(participant.result?.overall)
      ? Math.round(Number(participant.result.overall))
      : null,
    unknownCount: Math.round(safeNumber(participant.result?.transparency?.unknownCount))
  }));

  const pillarMap = new Map();
  participants.forEach((participant, index) => {
    (participant.result?.pillarScores ?? []).forEach((pillar) => {
      if (!hasFiniteScore(pillar.score)) return;
      if (!pillarMap.has(pillar.id)) {
        pillarMap.set(pillar.id, { id: pillar.id, label: pillarLabel(pillar, language), scores: [] });
      }
      pillarMap.get(pillar.id).scores.push({
        participantIndex: index,
        score: Math.round(Number(pillar.score))
      });
    });
  });

  const pillarRows = [...pillarMap.values()]
    .map((row) => {
      const values = row.scores.map((score) => score.score);
      const gap = values.length >= 2 ? Math.max(...values) - Math.min(...values) : null;
      return { ...row, gap };
    })
    .sort((a, b) => (b.gap ?? -1) - (a.gap ?? -1));

  const gapped = pillarRows.filter((row) => row.gap !== null);
  const convergence = gapped.filter((row) => row.gap <= 10);
  const divergence = gapped.filter((row) => row.gap > 20);
  const averageGap = gapped.length
    ? Math.round(gapped.reduce((sum, row) => sum + row.gap, 0) / gapped.length)
    : 0;

  return {
    groupId: group.id || "",
    language: language === "es" ? "es" : "en",
    participantCount: participants.length,
    participants: participantSummaries,
    pillarRows,
    biggestGap: gapped[0] || null,
    averageGap,
    convergence,
    divergence
  };
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function formatDate(value, language = "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "es" ? "es" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function summaryPdfText(language) {
  if (language === "es") {
    return {
      eyebrow: "AUTOEVALUACIÓN DE EMPRESA FAMILIAR",
      title: "Reporte resumen",
      forName: (name) => `para ${name}`,
      intro:
        "Un mapa conciso de conversación que muestra el resultado general, los puntajes por dimensión, las áreas de enfoque y la siguiente conversación sugerida.",
      brandName: "Gilbert Devlyn",
      brandLine: "Asesoría para Empresas Familiares",
      generated: (date) => `Generado ${date}`,
      overallScore: "Puntaje general",
      fallbackLevel: "Resumen de autoevaluación",
      whatThisSuggests: "Qué sugiere esto",
      focusAreas: "Áreas de enfoque",
      relativeStrengths: "Fortalezas relativas",
      noItemsRecorded: "No hay elementos registrados.",
      suggestedNextConversation: "Conversación sugerida",
      nextConversationBody:
        "Elige una conversación prioritaria en lugar de intentar resolver todos los temas de gobierno a la vez. Gilbert puede ayudar a convertir estas señales en una secuencia práctica de conversaciones y acuerdos.",
      pageOneOfTwo: "Página 1 de 2",
      confidentialFooter:
        "Resumen confidencial. Esto no es una calificación, asesoría legal, ni sustituye un proceso facilitado de gobierno familiar.",
      scoresByDimension: "Puntajes por dimensión",
      dimensionScoresGlance: "Puntajes por dimensión de un vistazo",
      dimensionIntro:
        "Cada puntaje es una señal para la conversación. Los puntajes bajos no son fracasos; simplemente señalan temas que pueden necesitar acuerdos más claros, mejor comunicación o un ritmo de gobierno más deliberado.",
      howToUsePage: "Cómo usar esta página",
      howToUseBody:
        "Usa los puntajes por dimensión para elegir una conversación con la que empezar. El mejor reporte no es el que tiene el puntaje más alto; es el que ayuda a la familia a decidir qué conversar primero.",
      pageTwoOfTwo: "Página 2 de 2",
      participantFallback: "Participante"
    };
  }

  return {
    eyebrow: "FAMILY ENTERPRISE SELF-ASSESSMENT",
    title: "Summary report",
    forName: (name) => `for ${name}`,
    intro:
      "A concise conversation map showing the overall result, dimension scores, focus areas, and suggested next conversation.",
    brandName: "Gilbert Devlyn",
    brandLine: "Family Enterprise Advisory",
    generated: (date) => `Generated ${date}`,
    overallScore: "Overall score",
    fallbackLevel: "Self-assessment summary",
    whatThisSuggests: "What this suggests",
    focusAreas: "Focus areas",
    relativeStrengths: "Relative strengths",
    noItemsRecorded: "No items recorded.",
    suggestedNextConversation: "Suggested next conversation",
    nextConversationBody:
      "Choose one priority conversation rather than trying to solve every governance topic at once. Gilbert can help turn these signals into a practical sequence of conversations and agreements.",
    pageOneOfTwo: "Page 1 of 2",
    confidentialFooter:
      "Confidential summary. This is not a grade, legal advice, or a substitute for a facilitated family governance process.",
    scoresByDimension: "Scores by dimension",
    dimensionScoresGlance: "Dimension scores at a glance",
    dimensionIntro:
      "Each score is a signal for conversation. Lower scores are not failures; they simply point to topics that may need clearer agreements, better communication, or a more deliberate governance rhythm.",
    howToUsePage: "How to use this page",
    howToUseBody:
      "Use the dimension scores to choose one conversation to begin with. The strongest report is not the one with the highest score; it is the one that helps the family decide what to discuss next.",
    pageTwoOfTwo: "Page 2 of 2",
    participantFallback: "Participant"
  };
}

export function createSummaryPdfBuffer(payload) {
  const report = payload ?? {};
  const language = report.language === "es" ? "es" : "en";
  const text = summaryPdfText(language);
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
    doc.text(text.confidentialFooter, margin, pageHeight - 29);
    doc.text(pageLabel, pageWidth - margin, pageHeight - 29, { align: "right" });
  }

  function sectionLabel(label, x, y) {
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(label).toUpperCase(), x, y);
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
      wrapText(doc, text.noItemsRecorded, x + 18, itemY, width - 36, 12);
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
  doc.text(text.eyebrow, margin, 52);

  doc.setTextColor("#ffffff");
  doc.setFontSize(36);
  doc.text(text.title, margin, 96);
  doc.setFontSize(18);
  doc.text(text.forName(report.name || text.participantFallback), margin, 126);

  doc.setTextColor("#d8c7b2");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  wrapText(doc, text.intro, margin, 160, 390, 15);

  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.setFontSize(13);
  doc.text(text.brandName, margin, 234);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#d8c7b2");
  doc.setFontSize(9);
  doc.text(text.brandLine, margin + 100, 234);
  doc.text(text.generated(formatDate(report.generatedAt, language)), pageWidth - margin, 234, {
    align: "right"
  });

  drawMetricCard(
    margin,
    284,
    178,
    135,
    text.overallScore,
    `${Math.round(safeNumber(report.overall))}`,
    `${report.level || text.fallbackLevel}`
  );

  const summaryX = margin + 198;
  const summaryWidth = pageWidth - margin * 2 - 198;
  doc.setFillColor("#ffffff");
  doc.roundedRect(summaryX, 284, summaryWidth, 135, 10, 10, "F");
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(text.whatThisSuggests, summaryX + 22, 318);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  wrapText(doc, report.resultSummary, summaryX + 22, 344, summaryWidth - 44, 14);

  let y = 452;
  const colWidth = (pageWidth - margin * 2 - 16) / 2;
  drawListCard(margin, y, colWidth, 142, text.focusAreas, report.focusAreas, copper);
  drawListCard(margin + colWidth + 16, y, colWidth, 142, text.relativeStrengths, report.strengths, forest);

  y += 172;
  doc.setFillColor(forest);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 92, 10, 10, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(text.suggestedNextConversation, margin + 20, y + 30);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#d8c7b2");
  doc.setFontSize(10);
  wrapText(doc, text.nextConversationBody, margin + 20, y + 53, pageWidth - margin * 2 - 40, 13);
  footer(text.pageOneOfTwo);

  doc.addPage();
  pageBackground();
  sectionLabel(text.scoresByDimension, margin, 56);
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(text.dimensionScoresGlance, margin, 88);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  wrapText(doc, text.dimensionIntro, margin, 118, pageWidth - margin * 2 - 70, 14);

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
  doc.text(text.howToUsePage, margin + 18, y + 31);
  doc.setTextColor(ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  wrapText(doc, text.howToUseBody, margin + 18, y + 51, pageWidth - margin * 2 - 36, 12);
  footer(text.pageTwoOfTwo);

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

function comparisonPdfText(language) {
  if (language === "es") {
    return {
      headerEyebrow: "GILBERT DEVLYN - COMPARACIÓN GRUPAL",
      confidential: "Confidencial - solo para el asesor",
      groupComparison: "Comparación grupal",
      group: (id) => `Grupo ${id}`,
      completedPerspectives: (count) => `${count} perspectivas completadas`,
      participants: "Participantes",
      pillarComparison: "Comparación por pilar",
      convergenceTitle: "Convergencia (brecha de 10 o menos)",
      divergenceTitle: "Divergencia (brecha mayor a 20)",
      noConvergence: "Todavía no hay convergencia clara.",
      noDivergence: "No hay brechas mayores a 20 puntos.",
      unknownAnswers: (count) => `Respuestas sin información: ${count}`,
      gap: (value) => (value === null ? "Brecha: N/D" : `Brecha: ${value}`),
      gapItem: (label, gap) => `${label} (brecha ${gap})`,
      pageOf: (page, total) => `Página ${page} de ${total}`,
      footerNote: "Comparación grupal confidencial - solo para el asesor"
    };
  }

  return {
    headerEyebrow: "GILBERT DEVLYN - GROUP COMPARISON",
    confidential: "Confidential - advisor use only",
    groupComparison: "Group comparison",
    group: (id) => `Group ${id}`,
    completedPerspectives: (count) => `${count} completed perspectives`,
    participants: "Participants",
    pillarComparison: "Pillar comparison",
    convergenceTitle: "Convergence (gap 10 or less)",
    divergenceTitle: "Divergence (gap over 20)",
    noConvergence: "No clear convergence yet.",
    noDivergence: "No major gaps above 20 points.",
    unknownAnswers: (count) => `Unknown answers: ${count}`,
    gap: (value) => (value === null ? "Gap: n/a" : `Gap: ${value}`),
    gapItem: (label, gap) => `${label} (gap ${gap})`,
    pageOf: (page, total) => `Page ${page} of ${total}`,
    footerNote: "Confidential group comparison - advisor use only"
  };
}

export function createComparisonPdfBuffer(payload) {
  const report = payload ?? {};
  const language = report.language === "es" ? "es" : "en";
  const text = comparisonPdfText(language);
  const participants = report.participants ?? [];
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 46;
  const forest = "#1c3d2e";
  const copper = "#c46f3a";
  const parchment = "#f8f3ea";
  const muted = "#6f726d";
  const ink = "#3f433f";
  let y = 0;

  function pageHeader(title) {
    doc.setFillColor(parchment);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(forest);
    doc.rect(0, 0, pageWidth, 92, "F");
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(text.headerEyebrow, margin, 38);
    doc.setTextColor("#ffffff");
    doc.setFontSize(22);
    doc.text(title, margin, 68);
    doc.setTextColor("#d8c7b2");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(text.confidential, pageWidth - margin, 38, { align: "right" });
    y = 120;
  }

  function ensureSpace(height) {
    if (y + height <= pageHeight - 70) return;
    doc.addPage();
    pageHeader(text.groupComparison);
  }

  function sectionTitle(title) {
    ensureSpace(34);
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(title).toUpperCase(), margin, y);
    y += 20;
  }

  function participantRow(participant) {
    ensureSpace(48);
    const scoreLabel = participant.overall === null ? "N/A" : `${participant.overall}/100`;
    doc.setFillColor("#ffffff");
    doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 8, 8, "F");
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    wrapText(doc, participant.label, margin + 16, y + 18, pageWidth - margin * 2 - 180, 12);
    doc.setTextColor(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(text.unknownAnswers(participant.unknownCount), margin + 16, y + 32);
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(scoreLabel, pageWidth - margin - 16, y + 25, { align: "right" });
    y += 48;
  }

  function pillarRow(row) {
    ensureSpace(40);
    const scoreText = row.scores.map((score) => `P${score.participantIndex + 1}: ${score.score}`).join("   ");
    doc.setFillColor("#ffffff");
    doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 6, 6, "F");
    doc.setTextColor(forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    wrapText(doc, row.label, margin + 14, y + 14, 190, 11);
    doc.setTextColor(ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(scoreText, margin + 214, y + 14);
    doc.setTextColor(row.gap === null ? muted : row.gap > 20 ? copper : forest);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(text.gap(row.gap), pageWidth - margin - 14, y + 19, {
      align: "right"
    });
    y += 38;
  }

  function listCard(title, items, emptyText, accent) {
    ensureSpace(30 + Math.max(1, items.length) * 16 + 20);
    doc.setTextColor(copper);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(title).toUpperCase(), margin, y);
    y += 18;
    const cardHeight = 20 + Math.max(1, items.length) * 16;
    doc.setFillColor("#ffffff");
    doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 8, 8, "F");
    let itemY = y + 22;
    if (!items.length) {
      doc.setTextColor(muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(emptyText, margin + 16, itemY);
    } else {
      items.forEach((item) => {
        doc.setFillColor(accent);
        doc.circle(margin + 18, itemY - 3, 3, "F");
        doc.setTextColor(ink);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(text.gapItem(item.label, item.gap), margin + 30, itemY);
        itemY += 16;
      });
    }
    y += cardHeight + 18;
  }

  pageHeader(text.group(report.groupId || ""));
  doc.setTextColor(forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(text.completedPerspectives(report.participantCount || 0), margin, y);
  y += 24;

  sectionTitle(text.participants);
  participants.forEach(participantRow);

  y += 6;
  sectionTitle(text.pillarComparison);
  (report.pillarRows || []).forEach(pillarRow);

  y += 6;
  listCard(text.convergenceTitle, report.convergence || [], text.noConvergence, forest);
  listCard(text.divergenceTitle, report.divergence || [], text.noDivergence, copper);

  const comparisonPageCount = doc.getNumberOfPages();
  for (let page = 1; page <= comparisonPageCount; page += 1) {
    doc.setPage(page);
    doc.setTextColor(muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(text.pageOf(page, comparisonPageCount), pageWidth - margin, pageHeight - 28, { align: "right" });
    doc.text(text.footerNote, margin, pageHeight - 28);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
