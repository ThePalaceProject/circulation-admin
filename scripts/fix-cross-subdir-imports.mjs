/**
 * fix-cross-subdir-imports.mjs
 *
 * The fix-depth-imports script over-corrected cross-subdirectory component
 * imports. When a file in src/components/announcements/ imports
 * ../shared/EditableInput (correct), it changed it to ../../shared/EditableInput
 * (wrong — that resolves to src/shared/ which doesn't exist).
 *
 * This script reverts those over-corrections:
 *   ../../shared/X   →  ../shared/X
 *   ../../book/X     →  ../book/X
 *   ... etc for all component subdirectory names
 *
 * Only touches files inside src/components/<subdir>/ (the moved components).
 */

import { readFileSync, writeFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const COMPONENT_SUBDIRS = [
  "announcements",
  "book",
  "catalog",
  "config",
  "dashboard",
  "diagnostics",
  "lanes",
  "layout",
  "lists",
  "patrons",
  "shared",
];

const COMPONENTS_DIR = `${process.cwd()}/src/components`;

let fixedFiles = 0;
let fixedCount = 0;

// Build a regex that matches ../../(subdir)/ in import strings
const subdirPattern = COMPONENT_SUBDIRS.join("|");
// Matches: from "../../(subdir)/..."  or  from '../../(subdir)/...'
const OVER_CORRECTED_RE = new RegExp(
  `(\\.\\./\\.\\./)(${subdirPattern})/`,
  "g"
);

for (const subdir of COMPONENT_SUBDIRS) {
  const subdirPath = join(COMPONENTS_DIR, subdir);
  let entries;
  try {
    entries = readdirSync(subdirPath);
  } catch {
    continue;
  }

  for (const file of entries) {
    if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
    const filePath = join(subdirPath, file);
    const original = readFileSync(filePath, "utf8");

    // Find all matches of ../../(component-subdir)/
    let updated = original.replace(OVER_CORRECTED_RE, (match, _dots, capturedSubdir) => {
      // Replace ../../subdir/ with ../subdir/
      return `../${capturedSubdir}/`;
    });

    if (updated !== original) {
      // Count how many replacements were made
      const matches = original.match(OVER_CORRECTED_RE) || [];
      fixedCount += matches.length;
      fixedFiles++;
      writeFileSync(filePath, updated, "utf8");
      console.log(`Fixed ${matches.length} import(s) in ${subdir}/${file}`);
    }
  }
}

console.log(`\nDone. Fixed ${fixedCount} import path(s) across ${fixedFiles} file(s).`);
