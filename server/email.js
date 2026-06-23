import tls from "node:tls";

const DEFAULT_FROM = "Gilbert Devlyn Advisory <info@gilbertdevlyn.com>";
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

function plainSummaryEmail(body) {
  const name = body.profile?.name || "there";
  const score = Math.round(Number(body.result?.overall ?? body.overall ?? 0));
  const priorities = priorityLines(body);

  return [
    `Hi ${name},`,
    "",
    "We received your family enterprise diagnostic and saved your summary report request.",
    "Gilbert will follow up directly with your summary report.",
    "",
    `Overall score: ${score}/100`,
    priorities.length ? `Priority areas: ${priorities.join(", ")}` : "",
    body.inviteLink ? `Invitation link: ${body.inviteLink}` : "",
    "",
    "The comparison view only shows pillar-level differences. Individual answers are not shared question by question.",
    "",
    "Gilbert Devlyn Advisory"
  ]
    .filter(Boolean)
    .join("\n");
}

function htmlSummaryEmail(body) {
  return plainSummaryEmail(body)
    .split("\n")
    .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<br>"))
    .join("");
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

function extractEmailAddress(value = "") {
  const match = String(value).match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
}

function encodeHeader(value = "") {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function smtpMessage({ from, to, replyTo, subject, text, html }) {
  const boundary = `gilbert-boundary-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];

  return [
    ...headers,
    "",
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

export async function sendSummaryReportEmails(body, savedResult = {}) {
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
    subject: "Your Gilbert Devlyn diagnostic summary request",
    text: plainSummaryEmail(body),
    html: htmlSummaryEmail(body)
  });

  const adminText = adminEmailText(body, savedResult.sessionKey);
  const adminEmail = await sendSmtpEmail(config, {
    from: config.from,
    to: config.adminEmail,
    replyTo: recipientEmail,
    subject: `New summary report request: ${body.profile?.name || recipientEmail}`,
    text: adminText,
    html: adminText
      .split("\n")
      .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<br>"))
      .join("")
  });

  return {
    provider: "smtp",
    sent: true,
    userMessageId: userEmail?.id,
    adminMessageId: adminEmail?.id
  };
}
