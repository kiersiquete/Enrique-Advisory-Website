import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");

function getLockedSpecifier(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\n\\s{6}'?${escaped}'?:\\n\\s{8}specifier:\\s*([^\\n]+)`);
  return lockfile.match(pattern)?.[1]?.trim();
}

const dependencies = {
  ...(manifest.dependencies ?? {}),
  ...(manifest.devDependencies ?? {})
};

for (const [name, expectedSpecifier] of Object.entries(dependencies)) {
  const actualSpecifier = getLockedSpecifier(name);
  assert.equal(
    actualSpecifier,
    expectedSpecifier,
    `pnpm-lock.yaml specifier for ${name} is ${actualSpecifier ?? "missing"}, expected ${expectedSpecifier}`
  );
}

console.log("Lockfile verification passed.");
