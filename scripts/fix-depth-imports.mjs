/**
 * fix-depth-imports.mjs
 *
 * Moved components are now one level deeper (components/subdir/ instead of
 * components/).  Their imports of src-level modules used "../module" but now
 * need "../../module".  This script applies that fix to every moved component.
 *
 * Specifically: any `from "../X"` where X is NOT a moved component
 * (i.e., not in COMPONENT_MAP) gets rewritten to `from "../../X"`.
 *
 * Run from the repo root:
 *   node scripts/fix-depth-imports.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const COMPONENTS = `${ROOT}/src/components`;

// Must match the keys from organize-components.mjs
import { createRequire } from "module";

// Inline the component name set (kept in sync with organize-components.mjs)
const MOVED_COMPONENTS = new Set([
  "Announcement","AnnouncementForm","AnnouncementsSection","SitewideAnnouncements",
  "BookCoverEditor","BookDetails","BookDetailsContainer","BookDetailsEditor",
  "BookDetailsEditorSuppression","BookDetailsTabContainer","BookEditForm",
  "Classifications","ClassificationsForm","ClassificationsTable","ComplaintForm",
  "Complaints","Contributors","GenreForm","CatalogPage","CatalogServices",
  "Collections","ConfigPage","ConfigTabContainer","DiscoveryServices",
  "EditableConfigList","IndividualAdminEditForm","IndividualAdmins","Libraries",
  "LibraryEditForm","LibraryRegistration","LibraryRegistrationForm",
  "MetadataServices","PatronAuthServices","ProtocolFormField","SelfTestResult",
  "SelfTests","SelfTestsCategory","SelfTestsTabContainer","ServiceEditForm",
  "ServiceWithRegistrationsEditForm","CirculationEventsDownload",
  "CirculationEventsDownloadForm","DashboardPage","InventoryReportRequestModal",
  "LibraryStats","QuicksightDashboard","QuicksightDashboardPage","SingleStatListItem",
  "Stats","StatsCollectionsBarChart","StatsCollectionsGroup","StatsCollectionsList",
  "StatsGroup","StatsInventoryGroup","StatsPatronGroup","StatsTotalCirculationsGroup",
  "StatsUsageReportsGroup","DiagnosticsServiceTabs","DiagnosticsServiceType",
  "DiagnosticsTabContainer","TroubleshootingCategoryPage","TroubleshootingPage",
  "TroubleshootingTabContainer","Lane","LaneCustomListsEditor","LaneEditor",
  "LanePage","Lanes","LanesSidebar","ContextProvider","Footer","Header","SetupPage",
  "WelcomePage","AdvancedSearchBooleanFilter","AdvancedSearchBuilder",
  "AdvancedSearchFilter","AdvancedSearchFilterInput","AdvancedSearchFilterViewer",
  "AdvancedSearchValueFilter","CustomListEditor","CustomListEntriesEditor",
  "CustomListPage","CustomListSearch","CustomListSearchQueryViewer","CustomLists",
  "CustomListsForBook","CustomListsSidebar","AccountPage","ChangePasswordForm",
  "DebugAuthentication","DebugResultListItem","ManagePatrons","ManagePatronsForm",
  "ManagePatronsTabContainer","NeighborhoodAnalyticsForm","PatronInfo","ResetAdobeId",
  "Autocomplete","CollectionImportButton","ColorPicker","ConfirmationModalWithOutcome",
  "EditableInput","EditorField","EntryPointsContainer","EntryPointsTabs","ErrorMessage",
  "InputList","LanguageField","ListLoadingIndicator","LoadButton","PairedMenus",
  "PasswordInput","SaveButton","ShareButton","TabContainer","TextWithEditMode",
  "Timestamp","ToolTip","UpdatingLoader","WithEditButton","WithRemoveButton",
]);

const SUBDIRS = [
  "announcements","book","catalog","config","dashboard","diagnostics",
  "lanes","layout","lists","patrons","shared",
];

/**
 * Fix "../X" → "../../X" for all non-component src-level imports.
 * These are imports that previously pointed to src/ via a single ../
 * but now need two levels up since the file is in components/subdir/.
 */
function fixDepthImports(content) {
  // Handle double-quoted imports: from "../X"
  let result = content.replace(
    /from "\.\.\/([^"]+)"/g,
    (match, path) => {
      const firstSegment = path.split("/")[0];
      if (MOVED_COMPONENTS.has(firstSegment)) return match; // already correct
      return `from "../../${path}"`;
    }
  );

  // Handle single-quoted imports: from '../X'
  result = result.replace(
    /from '\.\.\/([^']+)'/g,
    (match, path) => {
      const firstSegment = path.split("/")[0];
      if (MOVED_COMPONENTS.has(firstSegment)) return match; // already correct
      return `from '../../${path}'`;
    }
  );

  return result;
}

let totalUpdated = 0;

for (const subdir of SUBDIRS) {
  const subdirPath = `${COMPONENTS}/${subdir}`;
  const rawList = execSync(`ls "${subdirPath}" 2>/dev/null || true`).toString().trim();
  const files = rawList
    .split("\n")
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map((f) => `${subdirPath}/${f}`);

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const updated = fixDepthImports(original);
    if (updated !== original) {
      writeFileSync(file, updated);
      const shortPath = file.replace(ROOT + "/src/components/", "");
      console.log(`  Fixed: ${shortPath}`);
      totalUpdated++;
    }
  }
}

// Also fix src/__tests__/index-test.ts which imports ../components/SetupPage
const srcTestIndex = `${ROOT}/src/__tests__/index-test.ts`;
if (existsSync(srcTestIndex)) {
  let content = readFileSync(srcTestIndex, "utf8");
  const updated = content.replace(
    /from ["']\.\.\/components\/SetupPage["']/g,
    'from "../components/layout/SetupPage"'
  );
  if (updated !== content) {
    writeFileSync(srcTestIndex, updated);
    console.log("  Fixed: src/__tests__/index-test.ts");
    totalUpdated++;
  }
}

console.log(`\nFixed ${totalUpdated} files.`);
