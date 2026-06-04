import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 5174;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.post("/api/results", async (req, res) => {
  const entry = {
    createdAt: new Date().toISOString(),
    mode: req.body?.mode,
    language: req.body?.language,
    profile: req.body?.profile,
    groupId: req.body?.groupId,
    participantId: req.body?.participantId,
    contactRequested: Boolean(req.body?.contactRequested),
    overall: req.body?.overall,
    stageId: req.body?.stageId,
    pillarScores: req.body?.pillarScores
  };

  await fs.mkdir(path.join(rootDir, "storage"), { recursive: true });
  await fs.appendFile(
    path.join(rootDir, "storage", "results.jsonl"),
    `${JSON.stringify(entry)}\n`,
    "utf8"
  );

  res.json({ ok: true });
});

app.use(express.static(path.join(rootDir, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(rootDir, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Family Business Maturity API listening on ${port}`);
});
