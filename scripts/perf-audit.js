#!/usr/bin/env node
/**
 * Runs a local Lighthouse audit against the dev server and prints a
 * quick score summary. Meant to be triggered on every save via
 * `npm run perf:watch` (watches src/ and re-runs after a short debounce),
 * or invoked directly with `npm run perf:audit`.
 *
 * Note: this uses `lighthouse` (local headless Chrome), NOT `psi`.
 * The `psi` package calls Google's real PageSpeed Insights API, which
 * requires a publicly reachable URL — it cannot audit localhost. Use
 * `psi` against your deployed/preview URLs (e.g. in CI); use this script
 * for fast local feedback while developing.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const URL_TO_TEST = process.env.PERF_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", ".lighthouse-reports");
// lighthouse appends ".report.<ext>" to --output-path when multiple
// --output formats are requested, so this stays extension-less.
const OUT_BASE = path.join(OUT_DIR, "latest");
const OUT_JSON = `${OUT_BASE}.report.json`;
const OUT_HTML = `${OUT_BASE}.report.html`;

const COLORS = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

function scoreColor(score) {
  if (score >= 90) return COLORS.green;
  if (score >= 50) return COLORS.yellow;
  return COLORS.red;
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res) return true;
    } catch {
      // server not up yet, keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const up = await waitForServer(URL_TO_TEST);
  if (!up) {
    console.error(
      `[perf-audit] ${URL_TO_TEST} never responded — is the dev server running? ` +
        `(if you're using \`npm run perf:watch\` this should start automatically)`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`${COLORS.dim}[perf-audit] auditing ${URL_TO_TEST}...${COLORS.reset}`);

  try {
    execFileSync(
      "npx",
      [
        "lighthouse",
        URL_TO_TEST,
        "--output=json",
        "--output=html",
        `--output-path=${OUT_BASE}`,
        "--chrome-flags=--headless=new",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--quiet",
      ],
      { stdio: "inherit" }
    );
  } catch (err) {
    console.error(`[perf-audit] lighthouse run failed: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const report = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));

  console.log("\n--- Lighthouse scores ---");
  for (const cat of Object.values(report.categories)) {
    const score = Math.round((cat.score ?? 0) * 100);
    console.log(`${scoreColor(score)}${cat.title}: ${score}${COLORS.reset}`);
  }

  const metricIds = [
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
  ];
  console.log("\n--- Key metrics ---");
  for (const id of metricIds) {
    const audit = report.audits[id];
    if (audit) console.log(`${audit.title}: ${audit.displayValue}`);
  }

  console.log(`\n${COLORS.dim}Full report: ${OUT_HTML}${COLORS.reset}\n`);
}

main();
