import tls from "node:tls";
import {
  buildAdminReportPayload,
  buildComparisonReportPayload,
  buildSummaryReportPayload,
  createAdminPdfBuffer,
  createComparisonPdfBuffer,
  encodeActionToken,
  encodeSummaryReportPayload
} from "./summary-report.js";

const DEFAULT_FROM = "Gilbert <info@gilbertdevlyn.com>";
const DEFAULT_REPLY_TO = "info@gilbertdevlyn.com";
const SMTP_TIMEOUT_MS = 15000;
const MAX_GROUP_PARTICIPANTS = 3;

function smtpCaCertificates() {
  if (process.env.SMTP_USE_SYSTEM_CA === "false" || typeof tls.getCACertificates !== "function") {
    return undefined;
  }

  try {
    const defaultCertificates = tls.getCACertificates("default") ?? [];
    const systemCertificates = tls.getCACertificates("system") ?? [];
    const certificates = [...defaultCertificates, ...systemCertificates];
    return certificates.length ? certificates : undefined;
  } catch {
    return undefined;
  }
}

function getEmailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT || 465),
    user,
    pass,
    from: process.env.EMAIL_FROM || DEFAULT_FROM,
    replyTo: process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO,
    adminEmail: process.env.ADMIN_REPORT_EMAIL || process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO,
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false"
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hasFiniteScore(value) {
  return value !== null && value !== "" && Number.isFinite(Number(value));
}

function scoreLine(item) {
  if (!item?.label || !hasFiniteScore(item.score)) return "";
  return `${item.label}: ${Math.round(Number(item.score))}/100`;
}

function priorityLines(body) {
  const pillarScores = body.result?.pillarScores ?? [];
  return [...pillarScores]
    .filter((item) => hasFiniteScore(item.score))
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 3)
    .map(scoreLine)
    .filter(Boolean);
}

function participantName(body, fallback = "Participant") {
  return body.profile?.name || body.reportRequest?.recipientEmail || fallback;
}

function invitationStatus(body) {
  return body.inviteLink || body.inviteEmail ? "Invitation created" : "No invitation created";
}

function createSummaryPdfUrl(body, savedResult, options = {}) {
  const baseUrl = (options.baseUrl || process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!baseUrl) return "";

  const payload = buildSummaryReportPayload(body, savedResult);
  return `${baseUrl}/api/summary-pdf?data=${encodeSummaryReportPayload(payload)}`;
}

function createAdminPdfUrl(body, savedResult, options = {}) {
  const baseUrl = (options.baseUrl || process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!baseUrl) return "";

  const payload = buildAdminReportPayload(body, savedResult);
  return `${baseUrl}/api/advisor-report-pdf?data=${encodeSummaryReportPayload(payload)}`;
}

function createScheduleCallUrl(body, savedResult, options = {}) {
  const baseUrl = (options.baseUrl || process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!baseUrl) return "";

  const recipientEmail = body.reportRequest?.recipientEmail || body.profile?.email || "";
  if (!recipientEmail) return "";

  const report = buildAdminReportPayload(body, savedResult);
  const token = encodeActionToken({
    name: report.participant?.name || body.profile?.name || "",
    email: recipientEmail,
    language: body.language === "es" ? "es" : "en",
    sessionKey: savedResult.sessionKey || "",
    participant: {
      phone: report.participant?.phone || "",
      country: report.participant?.country || "",
      relationship: report.participant?.relationship || "",
      generation: report.participant?.generation || ""
    },
    result: {
      overall: report.overall,
      level: report.level || "",
      focusAreas: (report.focusAreas || []).slice(0, 3),
      unknownCount: report.transparency?.unknownCount ?? 0
    },
    context: {
      groupId: report.context?.groupId || "",
      participantId: report.context?.participantId || "",
      requestedAt: report.timing?.requestedAt || "",
      contactRequested: Boolean(report.context?.contactRequested)
    }
  });

  return `${baseUrl}/api/schedule-call?data=${token}`;
}

function isComparisonGroupFull(savedResult = {}) {
  const participantCount = savedResult.group?.participants?.length ?? savedResult.groupParticipantCount ?? 0;
  return participantCount >= MAX_GROUP_PARTICIPANTS;
}

function createInviteShareUrl(body, savedResult = {}, options = {}) {
  const baseUrl = (options.baseUrl || process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!baseUrl || !body.groupId || isComparisonGroupFull(savedResult)) return "";

  const url = new URL(`${baseUrl}/diagnostic`);
  url.searchParams.set("view", "invite");
  url.searchParams.set("group", body.groupId);
  url.searchParams.set("lang", body.language === "es" ? "es" : "en");
  if (body.profile?.name) url.searchParams.set("name", body.profile.name);

  return url.toString();
}

function plainSummaryEmail(body, savedResult = {}, options = {}) {
  const report = buildSummaryReportPayload(body, savedResult);
  const language = body.language === "es" ? "es" : "en";
  const name = report.name || (language === "es" ? "hola" : "there");
  const pdfUrl = createSummaryPdfUrl(body, savedResult, options);
  const scheduleCallUrl = createScheduleCallUrl(body, savedResult, options);
  const inviteShareUrl = createInviteShareUrl(body, savedResult, options);
  const groupIsFull = isComparisonGroupFull(savedResult);

  if (language === "es") {
    return [
      `Hola ${name},`,
      "",
      "Gracias por completar la Autoevaluación de Empresa Familiar.",
      "Tus resultados se guardaron y tu reporte resumen está listo para revisar.",
      "",
      `Puntaje general: ${report.overall}/100`,
      `Nivel: ${report.level}`,
      report.focusAreas?.length ? `Áreas de enfoque: ${report.focusAreas.join(", ")}` : "",
      "",
      "Qué puedes hacer ahora:",
      "1. Descargar tu PDF para guardarlo o compartirlo en una conversación.",
      "2. Pedir una conversación con Gilbert. Con un clic, Gilbert recibe una notificación.",
      inviteShareUrl
        ? "3. Invitar a alguien de la familia o empresa para comparar perspectivas dentro del mismo grupo."
        : groupIsFull
          ? "3. Este grupo de comparación ya está completo con 3 perspectivas."
          : "",
      "",
      pdfUrl ? `Descargar resultados en PDF: ${pdfUrl}` : "",
      scheduleCallUrl ? `Agendar una conversación con Gilbert: ${scheduleCallUrl}` : "",
      inviteShareUrl ? `Invitar a un familiar o colega: ${inviteShareUrl}` : "",
      "",
      "Este reporte es un punto de partida para la reflexión y la conversación. No es una calificación ni un veredicto.",
      "Si solicitas una conversación, Gilbert recibe una notificación automáticamente.",
      "",
      "Saludos,",
      "Gilbert"
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Hi ${name},`,
    "",
    "Thank you for completing the Family Enterprise Self-Assessment.",
    "Your results have been saved, and your summary report is ready to review.",
    "",
    `Overall score: ${report.overall}/100`,
    `Level: ${report.level}`,
    report.focusAreas?.length ? `Focus areas: ${report.focusAreas.join(", ")}` : "",
    "",
    "What you can do next:",
    "1. Download your PDF so you can keep it or use it in a conversation.",
    "2. Ask for a conversation with Gilbert. One click sends Gilbert a notification.",
    inviteShareUrl
      ? "3. Invite someone from the family or company to compare perspectives in the same group."
      : groupIsFull
        ? "3. This comparison group is already complete with 3 perspectives."
        : "",
    "",
    pdfUrl ? `Download results as a PDF: ${pdfUrl}` : "",
    scheduleCallUrl ? `Schedule a conversation with Gilbert: ${scheduleCallUrl}` : "",
    inviteShareUrl ? `Invite a family member or colleague: ${inviteShareUrl}` : "",
    "",
    "This report is a starting point for reflection and conversation. It is not a grade or verdict.",
    "If you request a conversation, Gilbert receives an automatic notification.",
    "",
    "Best,",
    "Gilbert"
  ]
    .filter(Boolean)
    .join("\n");
}

function plainInvitationEmail(invitation = {}) {
  const invitedBy = invitation.inviterName || "A family member";
  const language = invitation.language === "es" ? "es" : "en";

  if (language === "es") {
    return [
      "Hola,",
      "",
      `${invitedBy} te invitó a completar la Autoevaluación de Empresa Familiar de Gilbert Devlyn.`,
      "La autoevaluación toma cerca de 10 minutos y ayuda a comparar perspectivas por pilar dentro del mismo grupo familiar.",
      "Usa esta liga privada para responder:",
      "",
      invitation.inviteLink,
      "",
      "La comparación solo muestra diferencias por pilar. No comparte respuestas individuales pregunta por pregunta.",
      "",
      "Gracias,",
      "Gilbert"
    ].join("\n");
  }

  return [
    "Hi,",
    "",
    `${invitedBy} invited you to complete the Gilbert Devlyn Family Enterprise Self-Assessment.`,
    "The self-assessment takes about 10 minutes and helps compare pillar-level perspectives within the same family group.",
    "Use this private link to complete it:",
    "",
    invitation.inviteLink,
    "",
    "The comparison only shows pillar-level differences. It does not share individual answers or question-by-question details.",
    "",
    "Best,",
    "Gilbert"
  ].join("\n");
}

function htmlInvitationEmail(invitation = {}) {
  const language = invitation.language === "es" ? "es" : "en";
  const invitedBy = escapeHtml(invitation.inviterName || (language === "es" ? "Un familiar" : "A family member"));
  const inviteLink = escapeHtml(invitation.inviteLink);

  const text =
    language === "es"
      ? {
          title: "Te invitaron a la autoevaluación familiar",
          preheader: "Completa la autoevaluación y súmate a la comparación familiar privada.",
          eyebrow: "Invitación privada",
          body: `${invitedBy} te invitó a completar la Autoevaluación de Empresa Familiar de Gilbert Devlyn. Toma cerca de 10 minutos y ayuda a comparar perspectivas por pilar dentro del mismo grupo familiar.`,
          button: "Abrir autoevaluación",
          privacy:
            "La comparación solo muestra diferencias por pilar. No comparte respuestas individuales pregunta por pregunta.",
          footer: "Gilbert Devlyn - Asesoría para empresas familiares"
        }
      : {
          title: "You have been invited to the family self-assessment",
          preheader: "Complete the self-assessment and join the private family comparison.",
          eyebrow: "Private invitation",
          body: `${invitedBy} invited you to complete the Gilbert Devlyn Family Enterprise Self-Assessment. It takes about 10 minutes and helps compare pillar-level perspectives within the same family group.`,
          button: "Open self-assessment",
          privacy:
            "The comparison only shows pillar-level differences. It does not share individual answers or question-by-question details.",
          footer: "Gilbert Devlyn - Family Enterprise Advisory"
        };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(text.title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#F4EEE2; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <span style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;">${escapeHtml(text.preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4EEE2; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:28px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Gilbert Devlyn</p>
                <p style="margin:0; color:#f8f3ea; font-size:18px; line-height:1.4; font-weight:700;">${escapeHtml(text.footer)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">${escapeHtml(text.eyebrow)}</p>
                <h1 style="margin:0 0 18px; color:#1c3d2e; font-size:32px; line-height:1.1; font-weight:700;">${escapeHtml(text.title)}</h1>
                <p style="margin:0 0 24px; color:#454943; font-size:16px; line-height:1.65;">${text.body}</p>

                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background:#0F463C; border-radius:7px;">
                      <a href="${inviteLink}" style="display:inline-block; padding:15px 22px; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">${escapeHtml(text.button)}</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 18px; color:#454943; font-size:14px; line-height:1.65;">${escapeHtml(text.privacy)}</p>
                <p style="margin:0; color:#6f726d; font-size:12px; line-height:1.55; word-break:break-all;">${inviteLink}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function actionButtonRow(buttons) {
  const visible = buttons.filter((button) => button.url);
  if (!visible.length) return "";

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
    <tr>
      ${visible
        .map(
          (button, index) => `<td style="padding:${index === 0 ? "0" : "10px 0 0"};">
            <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
              <tr>
                <td style="background:${button.accent}; border-radius:7px;" align="center">
                  <a href="${escapeHtml(button.url)}" style="display:block; padding:15px 22px; color:${button.textColor || "#ffffff"}; font-size:15px; font-weight:700; text-decoration:none;">${escapeHtml(button.label)}</a>
                </td>
              </tr>
            </table>
          </td>`
        )
        .join("</tr><tr>")}
    </tr>
  </table>`;
}

function htmlSummaryEmail(body, savedResult = {}, options = {}) {
  const report = buildSummaryReportPayload(body, savedResult);
  const language = body.language === "es" ? "es" : "en";
  const pdfUrl = createSummaryPdfUrl(body, savedResult, options);
  const scheduleCallUrl = createScheduleCallUrl(body, savedResult, options);
  const inviteShareUrl = createInviteShareUrl(body, savedResult, options);
  const groupIsFull = isComparisonGroupFull(savedResult);
  const name = escapeHtml(report.name || (language === "es" ? "hola" : "there"));
  const focusAreas = (report.focusAreas || []).slice(0, 3);

  const text =
    language === "es"
      ? {
          title: "Tu reporte resumen de autoevaluación está listo",
          preheader: "Tu reporte resumen de la Autoevaluación de Empresa Familiar está listo para revisar.",
          eyebrow: "Resumen de autoevaluación",
          heading: "Tu reporte resumen está listo",
          intro: `Hola ${name}, gracias por completar la Autoevaluación de Empresa Familiar. Tus resultados se guardaron y tu reporte resumen está listo para revisar.`,
          overallScoreLabel: "Puntaje general",
          resultLevelLabel: "Nivel de resultado",
          focusAreasLabel: "Áreas de enfoque",
          disclaimer:
            "Este resumen es un punto de partida para la reflexión y la conversación. No es una calificación ni un veredicto, y las respuestas individuales pregunta por pregunta no se comparten en la vista de comparación.",
          nextStepsLabel: "Qué puedes hacer ahora",
          nextStepsIntro: inviteShareUrl
            ? "Elige el siguiente paso que mejor se ajuste a tu situación. Puedes guardar tu PDF, pedir una conversación con Gilbert o invitar a otra persona para comparar perspectivas."
            : "Elige el siguiente paso que mejor se ajuste a tu situación. Puedes guardar tu PDF o pedir una conversación con Gilbert.",
          downloadPdf: "Descargar resultados en PDF",
          downloadPdfHelp: "Guarda una copia clara de tu resultado individual.",
          scheduleCall: "Agendar una conversación con Gilbert",
          scheduleCallHelp: "Un clic notifica a Gilbert que quieres hablar sobre tus resultados.",
          inviteSomeone: "Invitar a un familiar o colega",
          inviteSomeoneHelp:
            "La persona invitada completa la misma autoevaluación de forma privada para crear una comparación por tema.",
          groupComplete: "Grupo de comparación completo",
          groupCompleteHelp:
            "Este grupo ya tiene 3 perspectivas completas, así que no se necesitan más invitaciones.",
          comparisonNote: groupIsFull
            ? "Este grupo ya alcanzó el límite de 3 perspectivas. La comparación ayuda a ver dónde coinciden las perspectivas y dónde conviene conversar primero."
            : "La comparación ayuda a ver dónde coinciden las perspectivas y dónde conviene conversar primero. No muestra respuestas individuales pregunta por pregunta.",
          footerNote: "Si solicitas una conversación, Gilbert recibe una notificación automáticamente.",
          footerName: "Gilbert Devlyn",
          footerLine: "Asesoría discreta y confidencial para empresas familiares."
        }
      : {
          title: "Your self-assessment report is ready",
          preheader: "Your Family Enterprise Self-Assessment summary report is ready to review.",
          eyebrow: "Self-assessment summary",
          heading: "Your summary report is ready",
          intro: `Hi ${name}, thank you for completing the Family Enterprise Self-Assessment. Your results have been saved, and your summary report is ready to review.`,
          overallScoreLabel: "Overall score",
          resultLevelLabel: "Result level",
          focusAreasLabel: "Focus areas",
          disclaimer:
            "This summary is a starting point for reflection and conversation. It is not a grade or verdict, and individual question-by-question answers are not shared in the comparison view.",
          nextStepsLabel: "What you can do next",
          nextStepsIntro: inviteShareUrl
            ? "Choose the next step that fits your situation. You can save your PDF, ask Gilbert for a conversation, or invite someone else to compare perspectives."
            : "Choose the next step that fits your situation. You can save your PDF or ask Gilbert for a conversation.",
          downloadPdf: "Download results as a PDF",
          downloadPdfHelp: "Keep a clear copy of your individual result.",
          scheduleCall: "Schedule a conversation with Gilbert",
          scheduleCallHelp: "One click notifies Gilbert that you would like to discuss your results.",
          inviteSomeone: "Invite a family member or colleague",
          inviteSomeoneHelp:
            "The invited person completes the same self-assessment privately so a topic-level comparison can be created.",
          groupComplete: "Comparison group complete",
          groupCompleteHelp:
            "This group already has 3 completed perspectives, so no additional invitation is needed.",
          comparisonNote: groupIsFull
            ? "This group has reached the 3-person comparison limit. The comparison can now show where perspectives align and where the first useful conversation may be."
            : "Comparison helps show where perspectives align and where the first useful conversation may be. It does not show individual question-by-question answers.",
          footerNote: "If you request a conversation, Gilbert receives an automatic notification.",
          footerName: "Gilbert Devlyn",
          footerLine: "Discreet, confidentiality-first advisory for family enterprises."
        };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(text.title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#F4EEE2; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <span style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;">
      ${escapeHtml(text.preheader)}
    </span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4EEE2; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:30px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Gilbert Devlyn</p>
                <p style="margin:0; color:#f8f3ea; font-size:18px; line-height:1.4; font-weight:700;">${escapeHtml(text.footerLine)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">${escapeHtml(text.eyebrow)}</p>
                <h1 style="margin:0 0 18px; color:#1c3d2e; font-size:34px; line-height:1.08; font-weight:700;">${escapeHtml(text.heading)}</h1>
                <p style="margin:0 0 22px; color:#454943; font-size:16px; line-height:1.65;">${text.intro}</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px; border-collapse:separate; border-spacing:0;">
                  <tr>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px 0 0 8px;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">${escapeHtml(text.overallScoreLabel)}</p>
                      <p style="margin:0; color:#1c3d2e; font-size:38px; line-height:1; font-weight:700;">${Math.round(Number(report.overall || 0))}<span style="font-size:16px; color:#6f726d;"> /100</span></p>
                    </td>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-left:0; border-radius:0 8px 8px 0;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">${escapeHtml(text.resultLevelLabel)}</p>
                      <p style="margin:0; color:#1c3d2e; font-size:18px; line-height:1.35; font-weight:700;">${escapeHtml(report.level)}</p>
                    </td>
                  </tr>
                </table>

                ${
                  focusAreas.length
                    ? `<div style="margin:0 0 24px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">${escapeHtml(text.focusAreasLabel)}</p>
                        ${focusAreas
                          .map(
                            (item) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:15px; line-height:1.45; font-weight:700;">${escapeHtml(item)}</p>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }

                <p style="margin:0 0 24px; color:#454943; font-size:15px; line-height:1.65;">${escapeHtml(text.disclaimer)}</p>

                <div style="margin:0 0 22px; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px;">
                  <p style="margin:0 0 8px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">${escapeHtml(text.nextStepsLabel)}</p>
                  <p style="margin:0 0 16px; color:#454943; font-size:14px; line-height:1.6;">${escapeHtml(text.nextStepsIntro)}</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="width:34px; vertical-align:top; padding:0 0 14px;">
                        <span style="display:inline-block; width:24px; height:24px; border-radius:999px; background:#0F463C; color:#ffffff; font-size:12px; line-height:24px; text-align:center; font-weight:700;">1</span>
                      </td>
                      <td style="padding:0 0 14px; color:#454943; font-size:14px; line-height:1.55;">
                        <strong style="color:#1c3d2e;">${escapeHtml(text.downloadPdf)}</strong><br>${escapeHtml(text.downloadPdfHelp)}
                      </td>
                    </tr>
                    <tr>
                      <td style="width:34px; vertical-align:top; padding:0 0 14px;">
                        <span style="display:inline-block; width:24px; height:24px; border-radius:999px; background:#F1C84C; color:#17352E; font-size:12px; line-height:24px; text-align:center; font-weight:700;">2</span>
                      </td>
                      <td style="padding:0 0 14px; color:#454943; font-size:14px; line-height:1.55;">
                        <strong style="color:#1c3d2e;">${escapeHtml(text.scheduleCall)}</strong><br>${escapeHtml(text.scheduleCallHelp)}
                      </td>
                    </tr>
                    ${
                      inviteShareUrl
                        ? `<tr>
                            <td style="width:34px; vertical-align:top; padding:0;">
                              <span style="display:inline-block; width:24px; height:24px; border-radius:999px; background:#EF563D; color:#ffffff; font-size:12px; line-height:24px; text-align:center; font-weight:700;">3</span>
                            </td>
                            <td style="padding:0; color:#454943; font-size:14px; line-height:1.55;">
                              <strong style="color:#1c3d2e;">${escapeHtml(text.inviteSomeone)}</strong><br>${escapeHtml(text.inviteSomeoneHelp)}
                            </td>
                          </tr>`
                        : groupIsFull
                          ? `<tr>
                              <td style="width:34px; vertical-align:top; padding:0;">
                                <span style="display:inline-block; width:24px; height:24px; border-radius:999px; background:#EF563D; color:#ffffff; font-size:12px; line-height:24px; text-align:center; font-weight:700;">3</span>
                              </td>
                              <td style="padding:0; color:#454943; font-size:14px; line-height:1.55;">
                                <strong style="color:#1c3d2e;">${escapeHtml(text.groupComplete)}</strong><br>${escapeHtml(text.groupCompleteHelp)}
                              </td>
                            </tr>`
                          : ""
                    }
                  </table>
                </div>

                ${actionButtonRow([
                  { url: pdfUrl, label: text.downloadPdf, accent: "#0F463C" },
                  { url: scheduleCallUrl, label: text.scheduleCall, accent: "#F1C84C", textColor: "#17352E" },
                  { url: inviteShareUrl, label: text.inviteSomeone, accent: "#EF563D" }
                ])}

                <p style="margin:0 0 18px; color:#454943; font-size:14px; line-height:1.65;">${escapeHtml(text.comparisonNote)}</p>
                <p style="margin:0; color:#6f726d; font-size:13px; line-height:1.55;">${escapeHtml(text.footerNote)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 34px; background:#1c3d2e;">
                <p style="margin:0; color:#f8f3ea; font-size:14px; line-height:1.5; font-weight:700;">${escapeHtml(text.footerName)}</p>
                <p style="margin:2px 0 0; color:#d8c7b2; font-size:12px; line-height:1.5;">${escapeHtml(text.footerLine)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function adminNotificationTitle(name, contactRequested) {
  return contactRequested ? `${name} wants to talk with you` : `${name} just finished assessment`;
}

function adminEmailText(body, savedResult = {}, options = {}) {
  const profile = body.profile ?? {};
  const name = participantName(body, "Participant");
  const score = Math.round(Number(body.result?.overall ?? body.overall ?? 0));
  const priorities = priorityLines(body);
  const adminPdfUrl = createAdminPdfUrl(body, savedResult, options);

  return [
    `${adminNotificationTitle(name, Boolean(body.reportRequest?.contactRequested))}.`,
    "",
    `Name: ${profile.name || "Unknown"}`,
    `Email: ${profile.email || "Unknown"}`,
    `Phone: ${profile.phoneInternational || profile.phoneNumber || "Not provided"}`,
    `Country: ${profile.countryLabel || profile.country || "Not provided"}`,
    `Relationship: ${profile.relationship || "Not provided"}`,
    `Generation: ${profile.generation || "Not provided"}`,
    `Language: ${body.language || "en"}`,
    `Overall score: ${score}/100`,
    priorities.length ? `Priority areas: ${priorities.join(", ")}` : "",
    `Wants to be contacted: ${body.reportRequest?.contactRequested ? "Yes" : "No"}`,
    `Invitation status: ${invitationStatus(body)}`,
    body.inviteEmail ? `Invited email: ${body.inviteEmail}` : "Invited email: Not provided",
    body.groupId ? `Group key: ${body.groupId}` : "",
    body.inviteLink ? `Invite link: ${body.inviteLink}` : "",
    adminPdfUrl ? `Advisor PDF: ${adminPdfUrl}` : "",
    savedResult.sessionKey ? `Airtable session key: ${savedResult.sessionKey}` : "",
    "",
    "Detailed advisor notes are retained in the Airtable Raw Result JSON."
  ]
    .filter(Boolean)
    .join("\n");
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:9px 0; color:#6f726d; font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:9px 0; color:#1c3d2e; font-size:14px; line-height:1.45; font-weight:700; text-align:right;">${escapeHtml(value || "Not provided")}</td>
  </tr>`;
}

export function htmlAdminEmail(body, savedResult = {}, options = {}) {
  const report = buildAdminReportPayload(body, savedResult);
  const priorities = (report.focusAreas || []).slice(0, 3);
  const participant = report.participant ?? {};
  const name = participant.name || report.name || "Participant";
  const completionTitle = adminNotificationTitle(name, Boolean(report.context?.contactRequested));
  const adminPdfUrl = createAdminPdfUrl(body, savedResult, options);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(completionTitle)}</title>
  </head>
  <body style="margin:0; padding:0; background:#F4EEE2; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <span style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;">
      ${escapeHtml(completionTitle)}.
    </span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4EEE2; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:28px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Advisor notification</p>
                <p style="margin:0; color:#f8f3ea; font-size:20px; line-height:1.35; font-weight:700;">${escapeHtml(completionTitle)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <h1 style="margin:0 0 12px; color:#1c3d2e; font-size:32px; line-height:1.1; font-weight:700;">${escapeHtml(name)}</h1>
                <p style="margin:0 0 24px; color:#454943; font-size:16px; line-height:1.65;">This person finished the Family Enterprise Self-Assessment and requested the summary report. The detailed advisor PDF is attached and includes the question-by-question appendix.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px 0 0 8px;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Overall score</p>
                      <p style="margin:0; color:#1c3d2e; font-size:38px; line-height:1; font-weight:700;">${Math.round(Number(report.overall || 0))}<span style="font-size:16px; color:#6f726d;"> /100</span></p>
                    </td>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-left:0; border-radius:0 8px 8px 0;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Unknown answers</p>
                      <p style="margin:0; color:#1c3d2e; font-size:38px; line-height:1; font-weight:700;">${Math.round(Number(report.transparency?.unknownCount || 0))}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px; border-top:1px solid #e5ded4; border-bottom:1px solid #e5ded4;">
                  ${detailRow("Email", participant.email)}
                  ${detailRow("Phone", participant.phone)}
                  ${detailRow("Country", participant.country)}
                  ${detailRow("Relationship", participant.relationship)}
                  ${detailRow("Generation", participant.generation)}
                  ${detailRow("Started", report.timing?.startedAt)}
                  ${detailRow("Requested", report.timing?.requestedAt)}
                  ${detailRow("Wants to be contacted", report.context?.contactRequested ? "Yes" : "No")}
                  ${detailRow("Invitation status", report.context?.inviteStatus)}
                  ${detailRow("Invited email", report.context?.inviteEmail)}
                  ${detailRow("Group key", report.context?.groupId)}
                </table>

                ${
                  priorities.length
                    ? `<div style="margin:0 0 24px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">Priority areas</p>
                        ${priorities
                          .map(
                            (item) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:15px; line-height:1.45; font-weight:700;">${escapeHtml(item)}</p>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }

                ${
                  adminPdfUrl
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px;">
                        <tr>
                          <td style="background:#0F463C; border-radius:7px;">
                            <a href="${escapeHtml(adminPdfUrl)}" style="display:inline-block; padding:15px 22px; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">View and download advisor PDF</a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }

                <p style="margin:0; color:#6f726d; font-size:13px; line-height:1.55;">Attached PDF: detailed advisor report with dimension scores, context notes, and submitted question-level answers.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function extractEmailAddress(value = "") {
  const match = String(value).match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
}

function encodeHeader(value = "") {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function encodeAttachmentContent(content) {
  return Buffer.from(content)
    .toString("base64")
    .replace(/.{1,76}/g, "$&\r\n")
    .trim();
}

function attachmentPart(boundary, attachment) {
  const filename = attachment.filename || "report.pdf";
  const contentType = attachment.contentType || "application/octet-stream";
  return [
    `--${boundary}`,
    `Content-Type: ${contentType}; name="${filename}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${filename}"`,
    "",
    encodeAttachmentContent(attachment.content),
    ""
  ].join("\r\n");
}

function alternativePart(boundary, text, html) {
  return [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
    ""
  ].join("\r\n");
}

function smtpMessage({ from, to, replyTo, subject, text, html, attachments = [] }) {
  const alternativeBoundary = `gilbert-alt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const mixedBoundary = `gilbert-mixed-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const hasAttachments = attachments.length > 0;
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    hasAttachments
      ? `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`
      : `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`
  ];

  if (!hasAttachments) {
    return [...headers, "", alternativePart(alternativeBoundary, text, html)].join("\r\n").replace(/^\./gm, "..");
  }

  return [
    ...headers,
    "",
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
    "",
    alternativePart(alternativeBoundary, text, html),
    ...attachments.map((attachment) => attachmentPart(mixedBoundary, attachment)),
    `--${mixedBoundary}--`,
    ""
  ]
    .join("\r\n")
    .replace(/^\./gm, "..");
}

function createSmtpSession(config) {
  let buffer = "";
  let pendingResolve;
  let pendingReject;
  const ca = smtpCaCertificates();

  const socket = tls.connect({
    host: config.host,
    port: config.port,
    servername: config.host,
    timeout: SMTP_TIMEOUT_MS,
    rejectUnauthorized: config.rejectUnauthorized,
    ...(ca ? { ca } : {})
  });

  socket.setEncoding("utf8");

  function resolvePendingResponse() {
    const lines = buffer.split(/\r?\n/).filter(Boolean);
    const lastLine = lines[lines.length - 1] || "";
    if (/^\d{3} /.test(lastLine) && pendingResolve) {
      const resolve = pendingResolve;
      pendingResolve = null;
      pendingReject = null;
      buffer = "";
      resolve(lines.join("\n"));
    }
  }

  socket.on("data", (chunk) => {
    buffer += chunk;
    resolvePendingResponse();
  });

  socket.on("error", (error) => {
    if (pendingReject) pendingReject(error);
  });

  socket.on("timeout", () => {
    socket.destroy(new Error("SMTP connection timed out"));
  });

  function readResponse(expectedCodes) {
    return new Promise((resolve, reject) => {
      pendingResolve = (response) => {
        const code = Number(response.slice(0, 3));
        if (!expectedCodes.includes(code)) {
          reject(new Error(`Unexpected SMTP response: ${response}`));
          return;
        }
        resolve(response);
      };
      pendingReject = reject;
      resolvePendingResponse();
    });
  }

  async function command(line, expectedCodes) {
    socket.write(`${line}\r\n`);
    return readResponse(expectedCodes);
  }

  return { socket, readResponse, command };
}

async function sendSmtpEmail(config, payload) {
  const fromAddress = extractEmailAddress(payload.from);
  const toAddress = extractEmailAddress(payload.to);
  const session = createSmtpSession(config);

  try {
    await session.readResponse([220]);
    await session.command("EHLO gilbertdevlyn.com", [250]);
    await session.command("AUTH LOGIN", [334]);
    await session.command(Buffer.from(config.user).toString("base64"), [334]);
    await session.command(Buffer.from(config.pass).toString("base64"), [235]);
    await session.command(`MAIL FROM:<${fromAddress}>`, [250]);
    await session.command(`RCPT TO:<${toAddress}>`, [250, 251]);
    await session.command("DATA", [354]);
    session.socket.write(`${smtpMessage(payload)}\r\n.\r\n`);
    await session.readResponse([250]);
    await session.command("QUIT", [221]);

    return { id: `smtp-${Date.now()}-${Math.random().toString(16).slice(2)}` };
  } finally {
    session.socket.end();
  }
}

export async function sendInvitationEmail(invitation = {}) {
  const config = getEmailConfig();
  if (!config) {
    return { skipped: true, reason: "missing-smtp-config" };
  }

  const invitedEmail = String(invitation.invitedEmail || "").trim();
  const inviteLink = String(invitation.inviteLink || "").trim();
  if (!invitedEmail) {
    return { skipped: true, reason: "missing-invited-email" };
  }
  if (!inviteLink) {
    return { skipped: true, reason: "missing-invite-link" };
  }

  const language = invitation.language === "es" ? "es" : "en";
  const message = await sendSmtpEmail(config, {
    from: config.from,
    to: invitedEmail,
    replyTo: invitation.inviterEmail || config.replyTo,
    subject: language === "es" ? "Invitación a la autoevaluación de Gilbert Devlyn" : "Gilbert Devlyn self-assessment invitation",
    text: plainInvitationEmail({ ...invitation, invitedEmail, inviteLink, language }),
    html: htmlInvitationEmail({ ...invitation, invitedEmail, inviteLink, language })
  });

  return {
    provider: "smtp",
    sent: true,
    messageId: message?.id
  };
}

export async function sendSummaryReportEmails(body, savedResult = {}, options = {}) {
  if (body.reportRequest?.status !== "requested") {
    return { skipped: true, reason: "no-summary-report-request" };
  }

  const config = getEmailConfig();
  if (!config) {
    return { skipped: true, reason: "missing-smtp-config" };
  }

  const recipientEmail = body.reportRequest?.recipientEmail || body.profile?.email;
  if (!recipientEmail) {
    return { skipped: true, reason: "missing-recipient-email" };
  }

  const language = body.language === "es" ? "es" : "en";
  const userEmail = await sendSmtpEmail(config, {
    from: config.from,
    to: recipientEmail,
    replyTo: config.replyTo,
    subject:
      language === "es"
        ? "Tu reporte resumen de autoevaluación está listo"
        : "Your self-assessment summary report is ready",
    text: plainSummaryEmail(body, savedResult, options),
    html: htmlSummaryEmail(body, savedResult, options)
  });

  const adminText = adminEmailText(body, savedResult, options);
  const adminPdf = createAdminPdfBuffer(buildAdminReportPayload(body, savedResult));
  const adminEmail = await sendSmtpEmail(config, {
    from: config.from,
    to: config.adminEmail,
    replyTo: recipientEmail,
    subject: adminNotificationTitle(
      participantName(body, recipientEmail),
      Boolean(body.reportRequest?.contactRequested)
    ),
    text: adminText,
    html: htmlAdminEmail(body, savedResult, options),
    attachments: [
      {
        filename: "gilbert-advisor-assessment-report.pdf",
        contentType: "application/pdf",
        content: adminPdf
      }
    ]
  });

  return {
    provider: "smtp",
    sent: true,
    userMessageId: userEmail?.id,
    adminMessageId: adminEmail?.id
  };
}

function htmlCallRequestEmail(request = {}) {
  const language = request.language === "es" ? "es" : "en";
  const name = escapeHtml(request.name || (language === "es" ? "Alguien" : "Someone"));
  const email = escapeHtml(request.email || "");
  const participant = request.participant || {};
  const result = request.result || {};
  const context = request.context || {};
  const focusAreas = Array.isArray(result.focusAreas) ? result.focusAreas.slice(0, 3) : [];

  const text =
    language === "es"
      ? {
          title: "Solicitud de conversación",
          body: `${name} completó la Autoevaluación de Empresa Familiar y solicitó una conversación contigo con un clic.`,
          profileTitle: "Perfil del participante",
          resultTitle: "Resultado de referencia",
          focusTitle: "Áreas de enfoque",
          contactTitle: "Cómo responder",
          contactBody: "Responde a este correo para contactar directamente a esta persona.",
          overallScore: "Puntaje general",
          resultLevel: "Nivel de resultado",
          name: "Nombre",
          email: "Email",
          phone: "Teléfono",
          country: "País",
          relationship: "Relación",
          generation: "Generación",
          requested: "Solicitado",
          groupKey: "Grupo"
        }
      : {
          title: "Conversation request",
          body: `${name} completed the Family Enterprise Self-Assessment and requested a one-click conversation with you.`,
          profileTitle: "Participant profile",
          resultTitle: "Result context",
          focusTitle: "Focus areas",
          contactTitle: "How to respond",
          contactBody: "Reply to this email to contact this person directly.",
          overallScore: "Overall score",
          resultLevel: "Result level",
          name: "Name",
          email: "Email",
          phone: "Phone",
          country: "Country",
          relationship: "Relationship",
          generation: "Generation",
          requested: "Requested",
          groupKey: "Group key"
        };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(text.title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#F4EEE2; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4EEE2; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:28px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Advisor notification</p>
                <p style="margin:0; color:#f8f3ea; font-size:20px; line-height:1.35; font-weight:700;">${escapeHtml(text.title)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px;">
                <p style="margin:0 0 18px; color:#454943; font-size:16px; line-height:1.6;">${text.body}</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
                  <tr>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px 0 0 8px;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">${escapeHtml(text.overallScore)}</p>
                      <p style="margin:0; color:#1c3d2e; font-size:36px; line-height:1; font-weight:700;">${escapeHtml(result.overall ?? "N/A")}<span style="font-size:15px; color:#6f726d;"> /100</span></p>
                    </td>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-left:0; border-radius:0 8px 8px 0;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">${escapeHtml(text.resultLevel)}</p>
                      <p style="margin:0; color:#1c3d2e; font-size:16px; line-height:1.35; font-weight:700;">${escapeHtml(result.level || "Not provided")}</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 10px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">${escapeHtml(text.profileTitle)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px; border-top:1px solid #e5ded4; border-bottom:1px solid #e5ded4;">
                  ${detailRow(text.name, request.name)}
                  ${detailRow(text.email, request.email)}
                  ${detailRow(text.phone, participant.phone)}
                  ${detailRow(text.country, participant.country)}
                  ${detailRow(text.relationship, participant.relationship)}
                  ${detailRow(text.generation, participant.generation)}
                  ${detailRow(text.requested, context.requestedAt)}
                  ${detailRow(text.groupKey, context.groupId)}
                </table>

                ${
                  focusAreas.length
                    ? `<div style="margin:0 0 22px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">${escapeHtml(text.focusTitle)}</p>
                        ${focusAreas
                          .map(
                            (item) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:15px; line-height:1.45; font-weight:700;">${escapeHtml(item)}</p>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }

                <div style="margin:0; padding:16px 18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px;">
                  <p style="margin:0 0 6px; color:#1c3d2e; font-size:15px; line-height:1.45; font-weight:700;">${escapeHtml(text.contactTitle)}</p>
                  <p style="margin:0 0 10px; color:#454943; font-size:14px; line-height:1.55;">${escapeHtml(text.contactBody)}</p>
                  <p style="margin:0; color:#1c3d2e; font-size:15px; line-height:1.6; font-weight:700;">${email}</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendCallRequestNotification(request = {}) {
  const config = getEmailConfig();
  if (!config) {
    return { skipped: true, reason: "missing-smtp-config" };
  }

  const requesterEmail = String(request.email || "").trim();
  if (!requesterEmail) {
    return { skipped: true, reason: "missing-requester-email" };
  }

  const language = request.language === "es" ? "es" : "en";
  const name = request.name || (language === "es" ? "Alguien" : "Someone");
  const focusAreas = Array.isArray(request.result?.focusAreas) ? request.result.focusAreas.slice(0, 3) : [];
  const message = await sendSmtpEmail(config, {
    from: config.from,
    to: config.adminEmail,
    replyTo: requesterEmail,
    subject:
      language === "es" ? `${name} quiere hablar contigo` : `${name} would like to speak with you`,
    text: [
      `${name} (${requesterEmail}) completed the Family Enterprise Self-Assessment and requested a one-click conversation with you.`,
      "",
      `Overall score: ${request.result?.overall ?? "Not provided"}/100`,
      `Result level: ${request.result?.level || "Not provided"}`,
      focusAreas.length ? `Focus areas: ${focusAreas.join(", ")}` : "",
      "",
      `Phone: ${request.participant?.phone || "Not provided"}`,
      `Country: ${request.participant?.country || "Not provided"}`,
      `Relationship: ${request.participant?.relationship || "Not provided"}`,
      `Generation: ${request.participant?.generation || "Not provided"}`,
      `Requested: ${request.context?.requestedAt || "Not provided"}`,
      `Group key: ${request.context?.groupId || "Not provided"}`,
      "",
      "Reply to this email to reach them directly."
    ]
      .filter(Boolean)
      .join("\n"),
    html: htmlCallRequestEmail({
      ...request,
      name,
      email: requesterEmail,
      language
    })
  });

  return {
    provider: "smtp",
    sent: true,
    messageId: message?.id
  };
}

function comparisonViewUrl(groupId, language, options = {}) {
  const baseUrl = (options.baseUrl || process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!baseUrl) return "";

  const token = encodeActionToken({ groupId, language });
  return `${baseUrl}/diagnostic?view=admin-comparison&data=${token}`;
}

function htmlComparisonReadyEmail(payload, viewUrl) {
  const participants = payload.participants || [];
  const convergence = payload.convergence || [];
  const divergence = payload.divergence || [];

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Group comparison ready</title>
  </head>
  <body style="margin:0; padding:0; background:#F4EEE2; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4EEE2; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:28px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Advisor notification</p>
                <p style="margin:0; color:#f8f3ea; font-size:20px; line-height:1.35; font-weight:700;">Group comparison ready</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <p style="margin:0 0 20px; color:#454943; font-size:16px; line-height:1.65;">${payload.participantCount} people have completed the self-assessment in group <strong>${escapeHtml(payload.groupId)}</strong>. This comparison is for advisor use only, respondents do not see this view.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px; border-collapse:separate; border-spacing:0;">
                  <tr>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px 0 0 8px;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Average gap</p>
                      <p style="margin:0; color:#1c3d2e; font-size:32px; line-height:1; font-weight:700;">${payload.averageGap}<span style="font-size:14px; color:#6f726d;"> pts</span></p>
                    </td>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-left:0; border-radius:0 8px 8px 0;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Largest gap</p>
                      <p style="margin:0; color:#1c3d2e; font-size:16px; line-height:1.35; font-weight:700;">${
                        payload.biggestGap
                          ? escapeHtml(`${payload.biggestGap.label} (${payload.biggestGap.gap} pts)`)
                          : "Not available"
                      }</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 10px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">Participants</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px; border-top:1px solid #e5ded4; border-bottom:1px solid #e5ded4;">
                  ${participants
                    .map((participant) =>
                      detailRow(participant.label, participant.overall === null ? "N/A" : `${participant.overall}/100`)
                    )
                    .join("")}
                </table>

                ${
                  divergence.length
                    ? `<div style="margin:0 0 22px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">Divergence (gap over 20)</p>
                        ${divergence
                          .map(
                            (row) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:14px; line-height:1.45; font-weight:700;">${escapeHtml(row.label)} - ${row.gap} pts</p>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }

                ${
                  convergence.length
                    ? `<div style="margin:0 0 22px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">Convergence (gap 10 or less)</p>
                        ${convergence
                          .map(
                            (row) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:14px; line-height:1.45; font-weight:700;">${escapeHtml(row.label)}</p>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }

                ${actionButtonRow([{ url: viewUrl, label: "View full comparison in browser", accent: "#0F463C" }])}

                <p style="margin:0; color:#6f726d; font-size:13px; line-height:1.55;">Attached PDF: full group comparison with pillar-by-pillar gaps.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendComparisonReadyEmail(group = {}, options = {}) {
  const config = getEmailConfig();
  if (!config) {
    return { skipped: true, reason: "missing-smtp-config" };
  }

  const language = options.language === "es" ? "es" : "en";
  const payload = buildComparisonReportPayload(group, language);
  if (payload.participantCount < 2) {
    return { skipped: true, reason: "not-enough-participants" };
  }

  const viewUrl = comparisonViewUrl(payload.groupId, language, options);
  const pdf = createComparisonPdfBuffer(payload);
  const subject = `Group comparison ready - ${payload.participantCount} perspectives (${payload.groupId})`;

  const text = [
    `A group comparison is ready for group ${payload.groupId}.`,
    "",
    `Completed perspectives: ${payload.participantCount}`,
    `Average score gap: ${payload.averageGap} points`,
    payload.biggestGap ? `Largest gap: ${payload.biggestGap.label} (${payload.biggestGap.gap} points)` : "",
    payload.convergence.length ? `Convergence areas: ${payload.convergence.map((row) => row.label).join(", ")}` : "",
    payload.divergence.length ? `Divergence areas: ${payload.divergence.map((row) => row.label).join(", ")}` : "",
    "",
    viewUrl ? `View the full comparison in your browser: ${viewUrl}` : "",
    "",
    "This comparison is for advisor use only. Respondents do not see this view."
  ]
    .filter(Boolean)
    .join("\n");

  const message = await sendSmtpEmail(config, {
    from: config.from,
    to: config.adminEmail,
    replyTo: config.replyTo,
    subject,
    text,
    html: htmlComparisonReadyEmail(payload, viewUrl),
    attachments: [
      {
        filename: `gilbert-group-comparison-${payload.groupId || "group"}.pdf`,
        contentType: "application/pdf",
        content: pdf
      }
    ]
  });

  return {
    provider: "smtp",
    sent: true,
    messageId: message?.id
  };
}

export function renderScheduleCallConfirmationPage(language = "en", ok = true) {
  const isSpanish = language === "es";
  const text = ok
    ? isSpanish
      ? {
          title: "Solicitud enviada",
          heading: "Gilbert fue notificado",
          body: "Gilbert fue notificado de que te gustaría hablar con él. Te contactará directamente en los próximos días hábiles.",
          back: "Volver al sitio"
        }
      : {
          title: "Request sent",
          heading: "Gilbert has been notified",
          body: "Gilbert has been notified that you would like to speak with him. He will reach out directly within the next business days.",
          back: "Back to the site"
        }
    : isSpanish
      ? {
          title: "No se pudo procesar la solicitud",
          heading: "Este enlace ya no es válido",
          body: "No pudimos confirmar esta solicitud de conversación. Vuelve a tu reporte por correo o contáctanos directamente.",
          back: "Volver al sitio"
        }
      : {
          title: "We could not process this request",
          heading: "This link is no longer valid",
          body: "We could not confirm this conversation request. Please return to your report email or contact us directly.",
          back: "Back to the site"
        };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(text.title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#F4EEE2; color:#17352E; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height:100vh; padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px; background:#ffffff; border:1px solid #ded8cf; border-radius:12px; overflow:hidden; text-align:center;">
            <tr>
              <td style="padding:44px 36px;">
                <div style="margin:0 auto 20px; width:56px; height:56px; border-radius:50%; background:#F1C84C; line-height:56px; font-size:26px; font-weight:700; color:#17352E;">&#10003;</div>
                <h1 style="margin:0 0 14px; color:#0F463C; font-size:26px; line-height:1.3; font-weight:700;">${escapeHtml(text.heading)}</h1>
                <p style="margin:0 0 26px; color:#454943; font-size:16px; line-height:1.6;">${escapeHtml(text.body)}</p>
                <a href="/" style="display:inline-block; padding:13px 24px; background:#0F463C; color:#ffffff; border-radius:7px; font-size:14px; font-weight:700; text-decoration:none;">${escapeHtml(text.back)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
