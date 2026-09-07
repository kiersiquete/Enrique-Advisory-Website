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
  sendComparisonReadyEmail,
  sendSummaryReportEmails
} from "./email.js";
import {
  enforceRateLimit,
  isTrustedApiRequest,
  setSecurityHeaders
} from "./http-security.js";
import {
  normalizeAssessmentSubmission,
  validateAssessmentSubmission
} from "./scoring.js";
import { publicBaseUrl, requestOrigin } from "./url.js";
import { isValidOpaqueId } from "./validation.js";

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
  sendSummaryEmails = sendSummaryReportEmails,
  sendComparisonEmail = sendComparisonReadyEmail
} = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    setSecurityHeaders(res);
    next();
  });
  app.use("/api", (req, res, next) => {
    setSecurityHeaders(res, { api: true });
    if (!isTrustedApiRequest(req)) {
      res.status(403).json({ error: "Cross-origin request denied" });
      return;
    }
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });
  app.use("/api/results", (req, res, next) => {
    if (
      req.method === "POST" &&
      !enforceRateLimit(req, res, "assessment-results", { limit: 5, windowMs: 15 * 60 * 1000 })
    ) {
      return;
    }
    next();
  });
  app.use(express.json({ limit: "64kb" }));
  app.use((error, _req, res, next) => {
    if (error?.status === 413 || error?.type === "entity.too.large") {
      res.status(413).json({ error: "Request body is too large" });
      return;
    }
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      res.status(400).json({ error: "Request body must be valid JSON" });
      return;
    }
    next(error);
  });

  app.post("/api/results", async (req, res) => {
    try {
      const body = normalizeAssessmentSubmission(req.body ?? {});
      validateAssessmentSubmission(body);
      const result = await persistAssessment(body);
      let email;
      if (result.isNewSubmission) {
        try {
          email = await sendSummaryEmails(body, result, { baseUrl: requestBaseUrl(req) });
        } catch (emailError) {
          console.error("Summary email delivery failed", emailError);
          email = { sent: false, error: "summary-email-delivery-failed" };
        }
      } else {
        email = { sent: false, skipped: true, reason: "duplicate-submission" };
      }

      if (result.isNewSubmission && (result.groupStatus?.participantCount ?? 0) >= 2) {
        try {
          const advisorGroup = await getComparisonGroup(body.groupId);
          await sendComparisonEmail(advisorGroup, {
            baseUrl: requestBaseUrl(req),
            language: body.language
          });
        } catch (comparisonError) {
          console.error("Comparison-ready email delivery failed", comparisonError);
        }
      }

      res.json({
        ok: true,
        persistence: result.persistence,
        result: result.result,
        groupStatus: result.groupStatus,
        email: publicEmailStatus(email)
      });
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

  app.use("/api/invitations", (_req, res) => {
    res.status(410).json({ error: "Email invitations are created in your own email app" });
  });
  app.use("/api/summary-pdf", (_req, res) => {
    res.status(410).json({ error: "Summary reports are delivered as email attachments" });
  });
  app.use("/api/schedule-call", (_req, res) => {
    res.status(410).json({ error: "Conversation requests must be explicitly confirmed by email" });
  });
  app.use("/api/advisor-report-pdf", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use("/api/comparison", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.get("/api/group-status", async (req, res) => {
    if (!enforceRateLimit(req, res, "group-status", { limit: 60, windowMs: 15 * 60 * 1000 })) {
      return;
    }
    const groupId = String(req.query.group ?? "").trim().toLowerCase();
    if (!isValidOpaqueId(groupId)) {
      res.status(400).json({ error: "Invalid comparison group key" });
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

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((req, res, next) => {
    if (shouldRedirectToPublicWeb(req)) {
      res.redirect(302, `${requestBaseUrl(req)}${req.originalUrl || req.url || "/"}`);
      return;
    }
    next();
  });

  app.use(express.static(path.join(rootDir, "dist")));

  app.use((req, res) => {
    res.sendFile(path.join(rootDir, "dist", "index.html"), (error) => {
      if (!error || res.headersSent) return;

      console.error("Static app fallback failed", error);
      res
        .status(404)
        .type("html")
        .send(renderMissingStaticAppPage(requestBaseUrl(req)));
    });
  });

  app.use((error, req, res, _next) => {
    console.error("Unhandled server error", error);
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      res.status(500).json({ error: "Unexpected server error" });
      return;
    }
    res.status(500).type("text").send("Unexpected server error");
  });

  return app;
}

function publicEmailStatus(email = {}) {
  return {
    sent: email.sent === true,
    skipped: email.skipped === true,
    ...(email.reason ? { reason: email.reason } : {}),
    ...(email.error ? { error: email.error } : {})
  };
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
  <body style="margin:0; padding:40px; font-family:Arial, Helvetica, sans-serif; color:#0F463C; background:#F4EEE2;">
    <main style="max-width:640px;">
      <p style="margin:0 0 8px; color:#EF563D; font-size:12px; font-weight:700; letter-spacing:.16em; text-transform:uppercase;">Website unavailable</p>
      <h1 style="margin:0 0 14px; font-size:32px; line-height:1.15;">Open the website from the web app server.</h1>
      <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">This local API server cannot serve the website files right now.</p>
      <a href="${homeUrl}" style="display:inline-block; padding:13px 18px; border-radius:7px; background:#0F463C; color:#fff; font-weight:700; text-decoration:none;">Open website</a>
    </main>
  </body>
</html>`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadLocalEnv().then(() => {
    const app = createApp();
    app.listen(port, "127.0.0.1", () => {
      console.log(`Family Business Maturity API listening on ${port}`);
    });
  });
}
