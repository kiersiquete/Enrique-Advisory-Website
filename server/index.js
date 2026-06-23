import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getComparisonGroupFromAirtable, persistAssessmentToAirtable } from "./airtable.js";
import { sendSummaryReportEmails } from "./email.js";

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
        email = await sendSummaryEmails(req.body ?? {}, result);
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  loadLocalEnv().then(() => {
    const app = createApp();
    app.listen(port, () => {
      console.log(`Family Business Maturity API listening on ${port}`);
    });
  });
}
