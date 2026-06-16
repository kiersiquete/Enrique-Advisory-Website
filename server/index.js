import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getComparisonGroupFromAirtable, persistAssessmentToAirtable } from "./airtable.js";

const app = express();
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

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.post("/api/results", async (req, res) => {
  try {
    const result = await persistAssessmentToAirtable(req.body ?? {});
    res.json(result);
  } catch (error) {
    console.error("Airtable persistence failed", error);
    res.status(500).json({ error: "Unable to save assessment result" });
  }
});

app.get("/api/groups", async (req, res) => {
  try {
    const group = await getComparisonGroupFromAirtable(req.query.group);
    res.json({ ok: true, group });
  } catch (error) {
    console.error("Airtable group lookup failed", error);
    res.status(500).json({ error: "Unable to load comparison group" });
  }
});

app.use(express.static(path.join(rootDir, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(rootDir, "dist", "index.html"));
});

loadLocalEnv().then(() => {
  app.listen(port, () => {
    console.log(`Family Business Maturity API listening on ${port}`);
  });
});
