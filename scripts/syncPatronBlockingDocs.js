#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Reads ../circulation/docs/FUNCTIONS.md, converts it to HTML, and writes
 * src/content/patronBlockingFunctionsHtml.ts — a TypeScript module that
 * exports the HTML as a string constant.
 *
 * Run via:  npm run sync-patron-blocking-docs
 *
 * Uses the UMD build of `marked` (bundled with the package) for markdown→HTML
 * conversion so this script has no extra runtime dependencies.
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Locate marked UMD build (CJS-compatible, no extra install needed)
// ---------------------------------------------------------------------------
let markedFn;
try {
  // marked ≥ v5 ships a UMD build at lib/marked.umd.js
  const { marked } = require("marked/lib/marked.umd.js");
  markedFn = marked;
} catch {
  try {
    const { marked } = require("marked");
    markedFn = marked;
  } catch {
    // Fallback: very small inline converter covering the elements used in
    // FUNCTIONS.md (headings, code blocks, inline code, tables, paragraphs,
    // horizontal rules, bold, lists).
    markedFn = null;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function convertMarkdown(md) {
  if (markedFn) {
    return markedFn(md);
  }

  // Minimal inline converter for the specific elements in FUNCTIONS.md.
  const lines = md.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      out.push(
        `<pre><code${
          lang ? ` class="language-${escapeHtml(lang)}"` : ""
        }>${codeLines.join("\n")}</code></pre>`
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push("<hr>");
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Table (detect by pipe characters)
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].match(/^\|?[\s\-|]+\|?$/)
    ) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      out.push(renderTable(tableLines));
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // List item
    if (/^[-*]\s/.test(line)) {
      out.push("<ul>");
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        out.push(`<li>${inlineMarkdown(lines[i].replace(/^[-*]\s/, ""))}</li>`);
        i++;
      }
      out.push("</ul>");
      continue;
    }

    // Paragraph
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("---") &&
      !lines[i].includes("|")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      out.push(`<p>${inlineMarkdown(paraLines.join(" "))}</p>`);
    }
  }

  return out.join("\n");
}

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function renderTable(tableLines) {
  const rows = tableLines.map((l) =>
    l
      .split("|")
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      .map((cell) => cell.trim())
  );
  const [header, , ...body] = rows; // second row is the separator
  const headerHtml = header
    .map((c) => `<th>${inlineMarkdown(escapeHtml(c))}</th>`)
    .join("");
  const bodyHtml = body
    .map(
      (row) =>
        `<tr>${row
          .map((c) => `<td>${inlineMarkdown(escapeHtml(c))}</td>`)
          .join("")}</tr>`
    )
    .join("\n");
  return `<table class="table table-condensed table-bordered"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

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
const html = convertMarkdown(markdown);

const tsContent = `// AUTO-GENERATED — do not edit by hand.
// Run \`npm run sync-patron-blocking-docs\` to regenerate from
// circulation/docs/FUNCTIONS.md.
const patronBlockingFunctionsHtml = ${JSON.stringify(html)};
export default patronBlockingFunctionsHtml;
`;

fs.mkdirSync(path.dirname(destTs), { recursive: true });
fs.writeFileSync(destTs, tsContent, "utf8");
console.log(`Written: ${destTs}`);
