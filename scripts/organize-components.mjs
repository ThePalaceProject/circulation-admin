/**
 * organize-components.mjs
 *
 * Moves src/components/*.tsx into domain subdirectories and rewrites all
 * affected import paths throughout the project.
 *
 * Run from the repo root:
 *   node scripts/organize-components.mjs
 *
 * Safe to re-run: skips files that have already been moved.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const COMPONENTS = `${ROOT}/src/components`;

// ─── 1. Component → subdirectory mapping ────────────────────────────────────
// Any component not listed here stays in its current location.

const COMPONENT_MAP = {
  // ── announcements ──────────────────────────────────────────────────────────
  Announcement: "announcements",
  AnnouncementForm: "announcements",
  AnnouncementsSection: "announcements",
  SitewideAnnouncements: "announcements",

  // ── book ───────────────────────────────────────────────────────────────────
  BookCoverEditor: "book",
  BookDetails: "book",
  BookDetailsContainer: "book",
  BookDetailsEditor: "book",
  BookDetailsEditorSuppression: "book",
  BookDetailsTabContainer: "book",
  BookEditForm: "book",
  Classifications: "book",
  ClassificationsForm: "book",
  ClassificationsTable: "book",
  ComplaintForm: "book",
  Complaints: "book",
  Contributors: "book",
  GenreForm: "book",

  // ── catalog ────────────────────────────────────────────────────────────────
  CatalogPage: "catalog",

  // ── config ─────────────────────────────────────────────────────────────────
  CatalogServices: "config",
  Collections: "config",
  ConfigPage: "config",
  ConfigTabContainer: "config",
  DiscoveryServices: "config",
  EditableConfigList: "config",
  IndividualAdminEditForm: "config",
  IndividualAdmins: "config",
  Libraries: "config",
  LibraryEditForm: "config",
  LibraryRegistration: "config",
  LibraryRegistrationForm: "config",
  MetadataServices: "config",
  PatronAuthServices: "config",
  ProtocolFormField: "config",
  SelfTestResult: "config",
  SelfTests: "config",
  SelfTestsCategory: "config",
  SelfTestsTabContainer: "config",
  ServiceEditForm: "config",
  ServiceWithRegistrationsEditForm: "config",

  // ── dashboard ──────────────────────────────────────────────────────────────
  CirculationEventsDownload: "dashboard",
  CirculationEventsDownloadForm: "dashboard",
  DashboardPage: "dashboard",
  InventoryReportRequestModal: "dashboard",
  LibraryStats: "dashboard",
  QuicksightDashboard: "dashboard",
  QuicksightDashboardPage: "dashboard",
  SingleStatListItem: "dashboard",
  Stats: "dashboard",
  StatsCollectionsBarChart: "dashboard",
  StatsCollectionsGroup: "dashboard",
  StatsCollectionsList: "dashboard",
  StatsGroup: "dashboard",
  StatsInventoryGroup: "dashboard",
  StatsPatronGroup: "dashboard",
  StatsTotalCirculationsGroup: "dashboard",
  StatsUsageReportsGroup: "dashboard",

  // ── diagnostics ────────────────────────────────────────────────────────────
  DiagnosticsServiceTabs: "diagnostics",
  DiagnosticsServiceType: "diagnostics",
  DiagnosticsTabContainer: "diagnostics",
  TroubleshootingCategoryPage: "diagnostics",
  TroubleshootingPage: "diagnostics",
  TroubleshootingTabContainer: "diagnostics",

  // ── lanes ──────────────────────────────────────────────────────────────────
  Lane: "lanes",
  LaneCustomListsEditor: "lanes",
  LaneEditor: "lanes",
  LanePage: "lanes",
  Lanes: "lanes",
  LanesSidebar: "lanes",

  // ── layout ─────────────────────────────────────────────────────────────────
  ContextProvider: "layout",
  Footer: "layout",
  Header: "layout",
  SetupPage: "layout",
  WelcomePage: "layout",

  // ── lists ──────────────────────────────────────────────────────────────────
  AdvancedSearchBooleanFilter: "lists",
  AdvancedSearchBuilder: "lists",
  AdvancedSearchFilter: "lists",
  AdvancedSearchFilterInput: "lists",
  AdvancedSearchFilterViewer: "lists",
  AdvancedSearchValueFilter: "lists",
  CustomListEditor: "lists",
  CustomListEntriesEditor: "lists",
  CustomListPage: "lists",
  CustomListSearch: "lists",
  CustomListSearchQueryViewer: "lists",
  CustomLists: "lists",
  CustomListsForBook: "lists",
  CustomListsSidebar: "lists",

  // ── patrons ────────────────────────────────────────────────────────────────
  AccountPage: "patrons",
  ChangePasswordForm: "patrons",
  DebugAuthentication: "patrons",
  DebugResultListItem: "patrons",
  ManagePatrons: "patrons",
  ManagePatronsForm: "patrons",
  ManagePatronsTabContainer: "patrons",
  NeighborhoodAnalyticsForm: "patrons",
  PatronInfo: "patrons",
  ResetAdobeId: "patrons",

  // ── shared ─────────────────────────────────────────────────────────────────
  Autocomplete: "shared",
  CollectionImportButton: "shared",
  ColorPicker: "shared",
  ConfirmationModalWithOutcome: "shared",
  EditableInput: "shared",
  EditorField: "shared",
  EntryPointsContainer: "shared",
  EntryPointsTabs: "shared",
  ErrorMessage: "shared",
  InputList: "shared",
  LanguageField: "shared",
  ListLoadingIndicator: "shared",
  LoadButton: "shared",
  PairedMenus: "shared",
  PasswordInput: "shared",
  SaveButton: "shared",
  ShareButton: "shared",
  TabContainer: "shared",
  TextWithEditMode: "shared",
  Timestamp: "shared",
  ToolTip: "shared",
  UpdatingLoader: "shared",
  WithEditButton: "shared",
  WithRemoveButton: "shared",
};

// ─── 2. Build reverse map: name → subdir  ────────────────────────────────────

const subdirs = [...new Set(Object.values(COMPONENT_MAP))];

// ─── 3. Create subdirectories ────────────────────────────────────────────────

console.log("Creating subdirectories...");
for (const dir of subdirs) {
  execSync(`mkdir -p "${COMPONENTS}/${dir}"`);
}

// ─── 4. Move component files (git mv) ────────────────────────────────────────

console.log("\nMoving component files...");
for (const [name, subdir] of Object.entries(COMPONENT_MAP)) {
  const src = `${COMPONENTS}/${name}.tsx`;
  const dest = `${COMPONENTS}/${subdir}/${name}.tsx`;
  if (existsSync(src)) {
    execSync(`git mv "${src}" "${dest}"`);
    console.log(`  ${name}.tsx → ${subdir}/`);
  } else if (!existsSync(dest)) {
    console.warn(`  WARN: ${name}.tsx not found in either location`);
  }
}

// ─── 5. Rewrite imports ───────────────────────────────────────────────────────
//
// Three cases:
//
//  A. src/index.tsx:
//     from "./components/X"  →  from "./components/subdir/X"
//
//  B. src/components/__tests__/X-test.tsx:
//     from "../X"  →  from "../subdir/X"
//
//  C. src/components/subdir/X.tsx (moved component):
//     from "./Y"  →  from "./Y"    (Y in same subdir)
//     from "./Y"  →  from "../otherSubdir/Y"  (Y in different subdir)
//
// We use explicit string substitution per component name — no fragile regex.

console.log("\nRewriting imports...");

/**
 * Apply all component import rewrites to a string of file content.
 *
 * @param {string} content - file content
 * @param {"src"|"tests"|"component"} context
 * @param {string|null} fromSubdir - subdir of the importing file (component context only)
 * @returns {string} updated content
 */
function rewriteContent(content, context, fromSubdir) {
  let result = content;

  for (const [name, toSubdir] of Object.entries(COMPONENT_MAP)) {
    if (context === "src") {
      // from "./components/Name" → from "./components/subdir/Name"
      result = result
        .replace(
          new RegExp(`from "(\\./components/)${name}"`, "g"),
          `from "./components/${toSubdir}/${name}"`
        )
        .replace(
          new RegExp(`from '(\\./components/)${name}'`, "g"),
          `from './components/${toSubdir}/${name}'`
        );
    } else if (context === "tests") {
      // from "../Name" → from "../subdir/Name"
      result = result
        .replace(
          new RegExp(`from "\\.\\.\/${name}"`, "g"),
          `from "../${toSubdir}/${name}"`
        )
        .replace(
          new RegExp(`from '\\.\\.\/${name}'`, "g"),
          `from '../${toSubdir}/${name}'`
        );
    } else if (context === "component") {
      if (fromSubdir === toSubdir) {
        // Same subdir — the sibling import "./Name" remains valid after the move.
        // No change needed.
      } else {
        // Different subdir: from "./Name" → from "../toSubdir/Name"
        result = result
          .replace(
            new RegExp(`from "\\.\/${name}"`, "g"),
            `from "../${toSubdir}/${name}"`
          )
          .replace(
            new RegExp(`from '\\.\/${name}'`, "g"),
            `from '../${toSubdir}/${name}'`
          );
      }
    }
  }

  return result;
}

// A. Process src/index.tsx
const indexPath = `${ROOT}/src/index.tsx`;
if (existsSync(indexPath)) {
  const original = readFileSync(indexPath, "utf8");
  const updated = rewriteContent(original, "src", null);
  if (updated !== original) {
    writeFileSync(indexPath, updated);
    console.log("  Updated: src/index.tsx");
  }
}

// B. Process test files in __tests__/
const testsDir = `${COMPONENTS}/__tests__`;
const rawTestList = execSync(`ls "${testsDir}" 2>/dev/null || true`).toString().trim();
const testFiles = rawTestList
  .split("\n")
  .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
  .map((f) => `${testsDir}/${f}`);

for (const testFile of testFiles) {
  const original = readFileSync(testFile, "utf8");
  const updated = rewriteContent(original, "tests", null);
  if (updated !== original) {
    writeFileSync(testFile, updated);
    console.log(`  Updated: __tests__/${testFile.split("/").pop()}`);
  }
}

// C. Process moved component files in each subdir
for (const subdir of subdirs) {
  const subdirPath = `${COMPONENTS}/${subdir}`;
  const rawList = execSync(`ls "${subdirPath}" 2>/dev/null || true`).toString().trim();
  const files = rawList
    .split("\n")
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map((f) => `${subdirPath}/${f}`);

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const updated = rewriteContent(original, "component", subdir);
    if (updated !== original) {
      writeFileSync(file, updated);
      console.log(`  Updated: ${subdir}/${file.split("/").pop()}`);
    }
  }
}

console.log("\nAll done.");
console.log("Next: node node_modules/typescript/bin/tsc --noEmit");
