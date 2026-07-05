import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getComparisonGroupFromAirtable,
  getGroupParticipantCount,
  MAX_GROUP_PARTICIPANTS,
  persistAssessmentToAirtable
} from "./airtable.js";
import {
  renderScheduleCallConfirmationPage,
  sendCallRequestNotification,
  sendComparisonReadyEmail,
  sendInvitationEmail,
  sendSummaryReportEmails
} from "./email.js";
import { normalizeAssessmentSubmission } from "./scoring.js";
import {
  createAdminPdfBuffer,
  createSummaryPdfBuffer,
  decodeActionToken,
  decodeSummaryReportPayload
} from "./summary-report.js";
import { publicBaseUrl, requestOrigin } from "./url.js";

const port = process.env.PORT || 5174;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function loadLocalEnv() {
  try {
    const envPath = path.join(rootDir, ".env");
    const { readFile } = await import("node:fs/promises");
    const contents = await readFile(envPath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=");
      }
    }
  } catch {
    // Production hosts provide environment variables directly.
  }
}

export function createApp({
  persistAssessment = persistAssessmentToAirtable,
  getComparisonGroup = getComparisonGroupFromAirtable,
  getGroupCount = getGroupParticipantCount,
  sendInviteEmail = sendInvitationEmail,
  sendSummaryEmails = sendSummaryReportEmails,
  sendCallRequest = sendCallRequestNotification,
  sendComparisonEmail = sendComparisonReadyEmail
} = {}) {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/results", async (req, res) => {
    try {
      const body = normalizeAssessmentSubmission(req.body ?? {});
      const result = await persistAssessment(body);
      let email;
      try {
        email = await sendSummaryEmails(body, result, { baseUrl: requestBaseUrl(req) });
      } catch (emailError) {
        console.error("Summary email delivery failed", emailError);
        email = { sent: false, error: "summary-email-delivery-failed" };
      }

      if ((result.group?.participants?.length ?? 0) >= 2) {
        try {
          await sendComparisonEmail(result.group, {
            baseUrl: requestBaseUrl(req),
            language: body.language
          });
        } catch (comparisonError) {
          console.error("Comparison-ready email delivery failed", comparisonError);
        }
      }

      res.json({ ...result, email });
    } catch (error) {
      if (error.code === "VALIDATION_ERROR") {
        res.status(400).json({ error: error.message });
        return;
      }

      console.error("Airtable persistence failed", error);
      res.status(500).json({ error: "Unable to save assessment result" });
    }
  });

  app.all("/api/results", (_req, res) => {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.post("/api/invitations", async (req, res) => {
    try {
      const email = await sendInviteEmail(req.body ?? {});
      res.json({ ok: true, email });
    } catch (error) {
      console.error("Invitation email delivery failed", error);
      res.status(500).json({ error: "Unable to send invitation email" });
    }
  });

  app.all("/api/invitations", (_req, res) => {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.get("/api/summary-pdf", (req, res) => {
    try {
      const payload = decodeSummaryReportPayload(req.query.data);
      const pdf = createSummaryPdfBuffer(payload);
      const safeName = String(payload.name || "summary").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="gilbert-devlyn-summary-${safeName || "report"}.pdf"`);
      res.setHeader("Cache-Control", "private, max-age=0, no-store");
      res.send(pdf);
    } catch {
      res.status(400).json({ error: "Unable to create summary PDF" });
    }
  });

  app.all("/api/summary-pdf", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.get("/api/advisor-report-pdf", (req, res) => {
    try {
      const payload = decodeSummaryReportPayload(req.query.data);
      const pdf = createAdminPdfBuffer(payload);
      const safeName = String(payload.name || payload.participant?.name || "advisor-report")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="gilbert-devlyn-advisor-report-${safeName || "report"}.pdf"`);
      res.setHeader("Cache-Control", "private, max-age=0, no-store");
      res.send(pdf);
    } catch {
      res.status(400).json({ error: "Unable to create advisor report PDF" });
    }
  });

  app.all("/api/advisor-report-pdf", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.get("/api/schedule-call", async (req, res) => {
    let language = "en";
    try {
      const payload = decodeActionToken(req.query.data);
      language = payload.language === "es" ? "es" : "en";

      try {
        await sendCallRequest({
          name: payload.name,
          email: payload.email,
          language,
          participant: payload.participant,
          result: payload.result,
          context: payload.context
        });
      } catch (notifyError) {
        console.error("Schedule-call notification failed", notifyError);
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(renderScheduleCallConfirmationPage(language, true));
    } catch (error) {
      res.status(400).setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(renderScheduleCallConfirmationPage(language, false));
    }
  });

  app.all("/api/schedule-call", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.get("/api/comparison", async (req, res) => {
    try {
      const payload = decodeActionToken(req.query.data);
      const language = payload.language === "es" ? "es" : "en";
      const group = await getComparisonGroup(payload.groupId);
      res.json({ ok: true, group, language });
    } catch (error) {
      res.status(400).json({ error: "Unable to load this comparison link" });
    }
  });

  app.all("/api/comparison", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.get("/api/group-status", async (req, res) => {
    const groupId = String(req.query.group ?? "").trim();
    if (!groupId) {
      res.status(400).json({ error: "Missing comparison group key" });
      return;
    }

    try {
      const participantCount = await getGroupCount(groupId);
      res.json({ ok: true, participantCount, maxParticipants: MAX_GROUP_PARTICIPANTS });
    } catch (error) {
      console.error("Group status lookup failed", error);
      res.status(500).json({ error: "Unable to load group status" });
    }
  });

  app.all("/api/group-status", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.use((req, res, next) => {
    if (shouldRedirectToPublicWeb(req)) {
      res.redirect(302, `${requestBaseUrl(req)}${req.originalUrl || req.url || "/"}`);
      return;
    }
    next();
  });

  app.use(express.static(path.join(rootDir, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootDir, "dist", "index.html"), (error) => {
      if (!error || res.headersSent) return;

      console.error("Static app fallback failed", error);
      res
        .status(404)
        .type("html")
        .send(renderMissingStaticAppPage(requestBaseUrl(req)));
    });
  });

  return app;
}

function requestBaseUrl(req) {
  return publicBaseUrl(req, "http");
}

function shouldRedirectToPublicWeb(req) {
  if (!["GET", "HEAD"].includes(req.method)) return false;
  if (req.path === "/api" || req.path.startsWith("/api/")) return false;

  const currentOrigin = requestOrigin(req, "http");
  const targetOrigin = requestBaseUrl(req);
  return Boolean(currentOrigin && targetOrigin && currentOrigin !== targetOrigin);
}

function renderMissingStaticAppPage(baseUrl) {
  const homeUrl = baseUrl || "/";
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Website unavailable</title>
  </head>
  <body style="margin:0; padding:40px; font-family:Arial, Helvetica, sans-serif; color:#1c3d2e; background:#f8f3ea;">
    <main style="max-width:640px;">
      <p style="margin:0 0 8px; color:#c4713a; font-size:12px; font-weight:700; letter-spacing:.16em; text-transform:uppercase;">Website unavailable</p>
      <h1 style="margin:0 0 14px; font-size:32px; line-height:1.15;">Open the website from the web app server.</h1>
      <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">This local API server cannot serve the website files right now.</p>
      <a href="${homeUrl}" style="display:inline-block; padding:13px 18px; border-radius:7px; background:#1c3d2e; color:#fff; font-weight:700; text-decoration:none;">Open website</a>
    </main>
  </body>
</html>`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadLocalEnv().then(() => {
    const app = createApp();
    app.listen(port, () => {
      console.log(`Family Business Maturity API listening on ${port}`);
    });
  });
}
