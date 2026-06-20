import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
assert.equal(vercel.framework, "vite", "Vercel should deploy the Vite app");
assert.equal(vercel.outputDirectory, "dist", "Vercel should serve the Vite build output");
assert.ok(
  vercel.rewrites?.some(
    (rewrite) => rewrite.source === "/((?!api/.*).*)" && rewrite.destination === "/index.html"
  ),
  "Vercel should preserve /api routes while sending app routes to index.html"
);

const viteConfig = readFileSync("vite.config.js", "utf8");
assert.match(
  viteConfig,
  /"\/api"\s*:\s*"http:\/\/localhost:5174"/,
  "Vite dev server should proxy /api to the local Express API"
);

const envExample = readFileSync(".env.example", "utf8");
for (const key of [
  "AIRTABLE_API_TOKEN",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_RESPONDENTS_TABLE",
  "AIRTABLE_SESSIONS_TABLE",
  "AIRTABLE_GROUPS_TABLE",
  "AIRTABLE_ANSWERS_TABLE",
  "AIRTABLE_RESPONDENTS_TABLE_ID",
  "AIRTABLE_SESSIONS_TABLE_ID",
  "AIRTABLE_GROUPS_TABLE_ID",
  "AIRTABLE_ANSWERS_TABLE_ID"
]) {
  assert.match(envExample, new RegExp(`^${key}=`, "m"), `.env.example is missing ${key}`);
}

console.log("Config verification passed.");
