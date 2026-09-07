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
assert.ok(
  vercel.headers?.some((entry) =>
    entry.headers?.some((header) => header.key === "Content-Security-Policy" && /frame-ancestors 'none'/.test(header.value))
  ),
  "Vercel should apply a CSP that prevents framing"
);
assert.ok(
  vercel.headers?.some(
    (entry) => entry.source === "/api/(.*)" && entry.headers?.some((header) => header.key === "Cache-Control" && /no-store/.test(header.value))
  ),
  "Vercel should prevent sensitive API response caching"
);

const viteConfig = readFileSync("vite.config.js", "utf8");
assert.match(
  viteConfig,
  /"\/api"\s*:\s*"http:\/\/127\.0\.0\.1:5174"/,
  "Vite dev server should proxy /api to the local Express API"
);
assert.match(viteConfig, /host:\s*"127\.0\.0\.1"/, "Vite should bind to loopback by default");
assert.match(viteConfig, /Content-Security-Policy/, "Vite should serve browser security headers");

const indexHtml = readFileSync("index.html", "utf8");
const advisoryDescription =
  "Helping business families make important decisions about ownership, succession and next-generation roles before misunderstandings become conflict.";
assert.ok(indexHtml.includes(advisoryDescription), "Homepage metadata should describe the advisory");
assert.doesNotMatch(
  indexHtml,
  /guided reflection tool for family business governance maturity/i,
  "Homepage metadata should not describe the site as only a self-assessment"
);
for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
  assert.match(indexHtml, new RegExp(`property=["']${property}["']`), `Homepage is missing ${property}`);
}
assert.match(
  indexHtml,
  /property="og:image" content="https:\/\/gilbertdevlyn\.com\/GILBERT\.jpg"/,
  "Social preview image should use an absolute production URL"
);
assert.match(indexHtml, /name="twitter:card" content="summary_large_image"/, "Homepage is missing its Twitter card");

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
  "AIRTABLE_ANSWERS_TABLE_ID",
  "PUBLIC_SITE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
  "ADMIN_REPORT_EMAIL"
]) {
  assert.match(envExample, new RegExp(`^${key}=`, "m"), `.env.example is missing ${key}`);
}

console.log("Config verification passed.");
