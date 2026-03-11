/**
 * fix-jest-tests.mjs
 *
 * Updates tests/jest/components/ test files to use new subdirectory paths.
 * Old: '../../../src/components/ComponentName'
 * New: '../../../src/components/subdir/ComponentName'
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

// Full component → subdirectory map (same as organize-components.mjs)
const COMPONENT_MAP = {
  // announcements
  Announcement: "announcements",
  AnnouncementForm: "announcements",
  AnnouncementsSection: "announcements",
  SitewideAnnouncements: "announcements",

  // book
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

  // catalog
  CatalogPage: "catalog",

  // config
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

  // dashboard
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

  // diagnostics
  DiagnosticsServiceTabs: "diagnostics",
  DiagnosticsServiceType: "diagnostics",
  DiagnosticsTabContainer: "diagnostics",
  TroubleshootingCategoryPage: "diagnostics",
  TroubleshootingPage: "diagnostics",
  TroubleshootingTabContainer: "diagnostics",

  // lanes
  Lane: "lanes",
  LaneCustomListsEditor: "lanes",
  LaneEditor: "lanes",
  LanePage: "lanes",
  Lanes: "lanes",
  LanesSidebar: "lanes",

  // layout
  ContextProvider: "layout",
  Footer: "layout",
  Header: "layout",
  SetupPage: "layout",
  WelcomePage: "layout",

  // lists
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

  // patrons
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

  // shared
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

const JEST_TESTS_DIR = `${process.cwd()}/tests/jest/components`;

// Build regex: matches ../../../src/components/ComponentName followed by quote or /
// e.g. '../../../src/components/Lane'  or  '../../../src/components/LaneEditor'
let fixedFiles = 0;

const files = readdirSync(JEST_TESTS_DIR).filter(
  (f) => f.endsWith(".test.tsx") || f.endsWith(".test.ts")
);

const BASE = "../../../src/components/";

for (const file of files) {
  const filePath = join(JEST_TESTS_DIR, file);
  let content = readFileSync(filePath, "utf8");
  let updated = content;

  // Replace in one pass: split on BASE then fix each segment
  const parts = updated.split(BASE);
  if (parts.length <= 1) continue; // no match

  updated = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    // segment starts with ComponentName followed by ' or " or /
    let replaced = false;
    // Sort by length descending so longer names match before shorter prefixes
    const sortedEntries = Object.entries(COMPONENT_MAP).sort(
      ([a], [b]) => b.length - a.length
    );
    for (const [componentName, subdir] of sortedEntries) {
      if (
        segment.startsWith(componentName + "'") ||
        segment.startsWith(componentName + '"') ||
        segment.startsWith(componentName + "/")
      ) {
        updated += BASE + subdir + "/" + segment;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      updated += BASE + segment;
    }
  }

  if (updated !== content) {
    console.log(`Fixed ${file}`);
    writeFileSync(filePath, updated, "utf8");
    fixedFiles++;
  }
}

console.log(`\nDone. Updated ${fixedFiles} file(s).`);
