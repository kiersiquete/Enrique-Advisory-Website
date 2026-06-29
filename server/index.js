import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getComparisonGroupFromAirtable, persistAssessmentToAirtable } from "./airtable.js";
import { sendInvitationEmail, sendSummaryReportEmails } from "./email.js";
import { createAdminPdfBuffer, createSummaryPdfBuffer, decodeSummaryReportPayload } from "./summary-report.js";

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
  sendInviteEmail = sendInvitationEmail,
  sendSummaryEmails = sendSummaryReportEmails
} = {}) {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/results", async (req, res) => {
    try {
      const result = await persistAssessment(req.body ?? {});
      let email;
      try {
        email = await sendSummaryEmails(req.body ?? {}, result, { baseUrl: requestBaseUrl(req) });
      } catch (emailError) {
        console.error("Summary email delivery failed", emailError);
        email = { sent: false, error: "summary-email-delivery-failed" };
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

  app.get("/api/groups", async (req, res) => {
    try {
      const group = await getComparisonGroup(req.query.group);
      res.json({ ok: true, group });
    } catch (error) {
      if (error.message === "Missing group key") {
        res.status(400).json({ error: "Missing comparison group key" });
        return;
      }

      console.error("Airtable group lookup failed", error);
      res.status(500).json({ error: "Unable to load comparison group" });
    }
  });

  app.all("/api/groups", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
  });

  app.use(express.static(path.join(rootDir, "dist")));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(rootDir, "dist", "index.html"));
  });

  return app;
}

function requestBaseUrl(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  const headers = req.headers || {};
  const protocol = headers["x-forwarded-proto"] || req.protocol || "http";
  const host = headers["x-forwarded-host"] || headers.host;
  return host ? `${protocol}://${host}` : "";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadLocalEnv().then(() => {
    const app = createApp();
    app.listen(port, () => {
      console.log(`Family Business Maturity API listening on ${port}`);
    });
  });
}
