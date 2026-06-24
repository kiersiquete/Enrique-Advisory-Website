import tls from "node:tls";
import {
  buildAdminReportPayload,
  buildSummaryReportPayload,
  createAdminPdfBuffer,
  encodeSummaryReportPayload
} from "./summary-report.js";

const DEFAULT_FROM = "Gilbert <info@gilbertdevlyn.com>";
const DEFAULT_REPLY_TO = "info@gilbertdevlyn.com";
const SMTP_TIMEOUT_MS = 15000;

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
    adminEmail: process.env.ADMIN_REPORT_EMAIL || process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreLine(item) {
  if (!item?.label || !Number.isFinite(Number(item.score))) return "";
  return `${item.label}: ${Math.round(Number(item.score))}/100`;
}

function priorityLines(body) {
  const pillarScores = body.result?.pillarScores ?? [];
  return [...pillarScores]
    .filter((item) => Number.isFinite(Number(item.score)))
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 3)
    .map(scoreLine)
    .filter(Boolean);
}

function createSummaryPdfUrl(body, savedResult, options = {}) {
  const baseUrl = (options.baseUrl || process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!baseUrl) return "";

  const payload = buildSummaryReportPayload(body, savedResult);
  return `${baseUrl}/api/summary-pdf?data=${encodeSummaryReportPayload(payload)}`;
}

function plainSummaryEmail(body, savedResult = {}, options = {}) {
  const report = buildSummaryReportPayload(body, savedResult);
  const name = report.name || "there";
  const pdfUrl = createSummaryPdfUrl(body, savedResult, options);

  return [
    `Hi ${name},`,
    "",
    "Thank you for completing the Family Enterprise Diagnostic.",
    "Your results have been saved, and your summary report is ready to review.",
    "",
    `Overall score: ${report.overall}/100`,
    `Level: ${report.level}`,
    report.focusAreas?.length ? `Focus areas: ${report.focusAreas.join(", ")}` : "",
    pdfUrl ? `View your PDF summary: ${pdfUrl}` : "",
    body.inviteLink ? `Invitation link: ${body.inviteLink}` : "",
    "",
    "This report is a starting point for reflection and conversation. It is not a grade or verdict.",
    "Gilbert will follow up directly if more context is needed.",
    "",
    "Best,",
    "Gilbert"
  ]
    .filter(Boolean)
    .join("\n");
}

function htmlSummaryEmail(body, savedResult = {}, options = {}) {
  const report = buildSummaryReportPayload(body, savedResult);
  const pdfUrl = createSummaryPdfUrl(body, savedResult, options);
  const name = escapeHtml(report.name || "there");
  const focusAreas = (report.focusAreas || []).slice(0, 3);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your diagnostic summary report is ready</title>
  </head>
  <body style="margin:0; padding:0; background:#f4efe6; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <span style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;">
      Your Family Enterprise Diagnostic summary report is ready to review.
    </span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe6; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:30px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Gilbert Devlyn</p>
                <p style="margin:0; color:#f8f3ea; font-size:18px; line-height:1.4; font-weight:700;">Family Enterprise Advisory</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <p style="margin:0 0 12px; color:#c46f3a; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Diagnostic summary</p>
                <h1 style="margin:0 0 18px; color:#1c3d2e; font-size:34px; line-height:1.08; font-weight:700;">Your summary report is ready</h1>
                <p style="margin:0 0 22px; color:#454943; font-size:16px; line-height:1.65;">Hi ${name}, thank you for completing the Family Enterprise Diagnostic. Your results have been saved, and your summary report is ready to review.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px; border-collapse:separate; border-spacing:0;">
                  <tr>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-radius:8px 0 0 8px;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Overall score</p>
                      <p style="margin:0; color:#1c3d2e; font-size:38px; line-height:1; font-weight:700;">${Math.round(Number(report.overall || 0))}<span style="font-size:16px; color:#6f726d;"> /100</span></p>
                    </td>
                    <td style="width:50%; padding:18px; background:#f8f3ea; border:1px solid #e5ded4; border-left:0; border-radius:0 8px 8px 0;">
                      <p style="margin:0 0 8px; color:#6f726d; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Result level</p>
                      <p style="margin:0; color:#1c3d2e; font-size:18px; line-height:1.35; font-weight:700;">${escapeHtml(report.level)}</p>
                    </td>
                  </tr>
                </table>

                ${
                  focusAreas.length
                    ? `<div style="margin:0 0 24px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#c46f3a; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">Focus areas</p>
                        ${focusAreas
                          .map(
                            (item) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:15px; line-height:1.45; font-weight:700;">${escapeHtml(item)}</p>`
                          )
                          .join("")}
                      </div>`
                    : ""
                }

                <p style="margin:0 0 24px; color:#454943; font-size:15px; line-height:1.65;">This summary is a starting point for reflection and conversation. It is not a grade or verdict, and individual question-by-question answers are not shared in the comparison view.</p>

                ${
                  pdfUrl
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                        <tr>
                          <td style="background:#c46f3a; border-radius:7px;">
                            <a href="${escapeHtml(pdfUrl)}" style="display:inline-block; padding:15px 22px; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none;">View your PDF summary</a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }

                <p style="margin:0; color:#6f726d; font-size:13px; line-height:1.55;">Gilbert will follow up directly if more context is needed.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 34px; background:#1c3d2e;">
                <p style="margin:0; color:#f8f3ea; font-size:14px; line-height:1.5; font-weight:700;">Gilbert Devlyn</p>
                <p style="margin:2px 0 0; color:#d8c7b2; font-size:12px; line-height:1.5;">Discreet, confidentiality-first advisory for family enterprises.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function adminEmailText(body, sessionKey) {
  const profile = body.profile ?? {};
  const score = Math.round(Number(body.result?.overall ?? body.overall ?? 0));
  const priorities = priorityLines(body);

  return [
    "A new summary report was requested from the website.",
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
    body.groupId ? `Group key: ${body.groupId}` : "",
    body.inviteLink ? `Invite link: ${body.inviteLink}` : "",
    sessionKey ? `Airtable session key: ${sessionKey}` : "",
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

export function htmlAdminEmail(body, savedResult = {}) {
  const report = buildAdminReportPayload(body, savedResult);
  const priorities = (report.focusAreas || []).slice(0, 3);
  const participant = report.participant ?? {};

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New diagnostic summary request</title>
  </head>
  <body style="margin:0; padding:0; background:#f4efe6; color:#1c3d2e; font-family:Arial, Helvetica, sans-serif;">
    <span style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;">
      A new diagnostic summary report was requested.
    </span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe6; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px; background:#ffffff; border:1px solid #ded8cf; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#1c3d2e; padding:28px 34px;">
                <p style="margin:0 0 7px; color:#d07a42; font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Advisor notification</p>
                <p style="margin:0; color:#f8f3ea; font-size:20px; line-height:1.35; font-weight:700;">New diagnostic summary request</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;">
                <h1 style="margin:0 0 12px; color:#1c3d2e; font-size:32px; line-height:1.1; font-weight:700;">${escapeHtml(participant.name || report.name || "Participant")}</h1>
                <p style="margin:0 0 24px; color:#454943; font-size:16px; line-height:1.65;">This person requested a summary report from the Family Enterprise Diagnostic. The detailed advisor PDF is attached and includes the question-by-question appendix.</p>

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
                  ${detailRow("Group key", report.context?.groupId)}
                </table>

                ${
                  priorities.length
                    ? `<div style="margin:0 0 24px; padding:18px; border:1px solid #e5ded4; border-radius:8px;">
                        <p style="margin:0 0 12px; color:#c46f3a; font-size:12px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">Priority areas</p>
                        ${priorities
                          .map(
                            (item) =>
                              `<p style="margin:8px 0 0; color:#1c3d2e; font-size:15px; line-height:1.45; font-weight:700;">${escapeHtml(item)}</p>`
                          )
                          .join("")}
                      </div>`
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

  const socket = tls.connect({
    host: config.host,
    port: config.port,
    servername: config.host,
    timeout: SMTP_TIMEOUT_MS
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

  const userEmail = await sendSmtpEmail(config, {
    from: config.from,
    to: recipientEmail,
    replyTo: config.replyTo,
    subject: "Your diagnostic summary report is ready",
    text: plainSummaryEmail(body, savedResult, options),
    html: htmlSummaryEmail(body, savedResult, options)
  });

  const adminText = adminEmailText(body, savedResult.sessionKey);
  const adminPdf = createAdminPdfBuffer(buildAdminReportPayload(body, savedResult));
  const adminEmail = await sendSmtpEmail(config, {
    from: config.from,
    to: config.adminEmail,
    replyTo: recipientEmail,
    subject: `New summary report request: ${body.profile?.name || recipientEmail}`,
    text: adminText,
    html: htmlAdminEmail(body, savedResult),
    attachments: [
      {
        filename: "gilbert-advisor-diagnostic-report.pdf",
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
