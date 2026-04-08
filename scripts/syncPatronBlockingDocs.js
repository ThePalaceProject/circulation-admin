#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Reads ../circulation/docs/FUNCTIONS.md, converts it to HTML, and writes
 * src/content/patronBlockingFunctionsHtml.ts — a TypeScript module that
 * exports the HTML as a string constant.
 *
 * Run via:  npm run sync-patron-blocking-docs
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const srcMd = path.resolve(__dirname, "../../circulation/docs/FUNCTIONS.md");
const destTs = path.resolve(
  __dirname,
  "../src/content/patronBlockingFunctionsHtml.ts"
);

if (!fs.existsSync(srcMd)) {
  console.error(`Source not found: ${srcMd}`);
  process.exit(1);
}

const markdown = fs.readFileSync(srcMd, "utf8");
const html = marked(markdown);

const tsContent = `// AUTO-GENERATED — do not edit by hand.
// Run \`npm run sync-patron-blocking-docs\` to regenerate from
// circulation/docs/FUNCTIONS.md.
const patronBlockingFunctionsHtml = ${JSON.stringify(html)};
export default patronBlockingFunctionsHtml;
`;

fs.mkdirSync(path.dirname(destTs), { recursive: true });
fs.writeFileSync(destTs, tsContent, "utf8");
console.log(`Written: ${destTs}`);
