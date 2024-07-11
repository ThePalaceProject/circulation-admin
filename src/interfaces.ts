/* eslint-disable */

export interface FeatureFlags {
  enableAutoList?: boolean;
  reportsOnlyForSysadmins?: boolean;
}

export interface Navigate {
  (collectionUrl: string, bookUrl: string, tab?: string): void;
}

export interface LinkData {
  href: string;
  rel: string;
  role?: string;
  title?: string;
  type?: string;
}

export interface CategoryData {
  label: string;
}

export interface ContributorData {
  name: string;
  uri?: string;
  role?: string;
}

export interface BookData {
  id: string;
  title: string;
  authors?: ContributorData[];
  contributors?: ContributorData[];
  subtitle?: string;
  fiction?: boolean;
  audience?: string;
  targetAgeRange?: string[];
  medium?: string;
  language?: string;
  publisher?: string;
  imprint?: string;
  summary?: string;
  hideLink?: LinkData;
  restoreLink?: LinkData;
  refreshLink?: LinkData;
  suppressPerLibraryLink?: LinkData;
  unsuppressPerLibraryLink?: LinkData;
  editLink?: LinkData;
  issuesLink?: LinkData;
  changeCoverLink?: LinkData;
  categories?: string[];
  series?: string;
  seriesPosition?: number;
  issued?: string;
  rating?: number;
  coverUrl?: string;
}

export interface RolesData {
  [key: string]: string;
}

export interface MediaData {
  [key: string]: string;
}

export interface LanguagesData {
  [key: string]: string[];
}

export interface RightsStatusData {
  [key: string]: {
    name: string;
    open_access: boolean;
    allows_derivatives: boolean;
  };
}

export interface BookLink {
  text: string;
  url: (book: BookData) => string;
}

export interface ComplaintsData {
  book: {
    id: string;
  };
  complaints: { [key: string]: number };
}

export interface PostComplaint {
  (url: string, data: { type: string }): Promise<any>;
}

export type Audience = "Children" | "Young Adult" | "Adult" | "Adults Only";

export type Fiction = "Fiction" | "Nonfiction";

export interface GenreTree {
  Fiction: {
    [index: string]: GenreData;
  };
  Nonfiction: {
    [index: string]: GenreData;
  };
}

export interface GenreData {
  name: string;
  parents: string[];
  subgenres: string[];
}

export interface ClassificationData {
  type: string;
  name: string;
  source: string;
  weight: number;
}

export interface CirculationEventData {
  id: number;
  type: string;
  patron_id: string;
  time: string;
  book: {
    title: string;
    url: string;
  };
}

export interface InventoryStatistics {
  titles: number;
  availableTitles: number;
  selfHostedTitles: number;
  openAccessTitles: number;
  licensedTitles: number;
  unlimitedLicenseTitles: number;
  meteredLicenseTitles: number;
  meteredLicensesOwned: number;
  meteredLicensesAvailable: number;
}

export interface InventoryByMedium {
  [medium: string]: InventoryStatistics;
}

export interface PatronStatistics {
  total: number;
  withActiveLoan: number;
  withActiveLoanOrHold: number;
  loans: number;
  holds: number;
}

export interface LibraryStatistics {
  key: string;
  name: string;
  patronStatistics: PatronStatistics;
  inventorySummary: InventoryStatistics;
  inventoryByMedium?: InventoryByMedium;
  collectionIds: number[];
  collections?: CollectionInventory[];
}

export interface CollectionInventory {
  id: number;
  name: string;
  inventory: InventoryStatistics;
  inventoryByMedium?: InventoryByMedium;
}

export interface StatisticsData {
  collections: CollectionInventory[];
  collectionIds?: number[];
  collectionIdMap?: {
    [id: number]: CollectionInventory;
  };
  libraries: LibraryStatistics[];
  libraryKeyMap?: {
    [key: string]: LibraryStatistics;
  };
  inventorySummary: InventoryStatistics;
  inventoryByMedium?: InventoryByMedium;
  patronSummary: PatronStatistics;
  summaryStatistics?: LibraryStatistics;
}

export interface DiagnosticsData {
  monitor?: DiagnosticsServiceData[];
  script?: DiagnosticsServiceData[];
  coverage_provider?: DiagnosticsServiceData[];
  other?: DiagnosticsServiceData[];
}

export interface DiagnosticsServiceData {
  [key: string]: DiagnosticsCollectionData[];
}

export interface DiagnosticsCollectionData {
  [key: string]: TimestampData[];
}

export interface TimestampData {
  achievements?: string;
  collection_name: string;
  duration: string;
  exception?: string;
  id: string;
  service: string;
  start: string;
}

export interface LibraryData {
  uuid?: string;
  name?: string;
  short_name?: string;
  settings?: {
    [key: string]: string | string[] | {}[];
  };
}

export interface LibrarySettingField {
  key: string;
  label: string;
  required?: boolean;
  category?: string;
}

export interface LibrariesData {
  libraries: LibraryData[];
  settings?: LibrarySettingField[];
}

export interface LibraryWithSettingsData {
  short_name: string;
  [key: string]: string;
}

export interface SettingData {
  key: string;
  label: string;
  description?: string;
  default?: string | string[] | Object[];
  required?: boolean;
  randomizable?: boolean;
  type?: string;
  options?: SettingData[];
  instructions?: string;
  format?: string;
  urlBase?: any;
  paired?: string;
  readOnly?: boolean;
  capitalize?: boolean;
  skip?: boolean;
  level?: number;
}

export interface ProtocolData {
  name: string;
  label?: string;
  description?: string;
  instructions?: string;
  sitewide?: boolean;
  supports_registration?: boolean;
  supports_staging?: boolean;
  settings: SettingData[];
  child_settings?: SettingData[];
  library_settings?: SettingData[];
}

export interface SelfTestsException {
  class: string;
  debug_message: string;
  message: string;
}

export interface SelfTestsResult {
  duration: number;
  end: string;
  exception?: SelfTestsException;
  name: string;
  result?: string | string[];
  start: string;
  success: boolean;
  collection?: string;
}

export interface SelfTestsData {
  duration: number;
  start: string;
  end: string;
  results: SelfTestsResult[];
  exception?: string;
  disabled?: boolean;
}

export interface ServiceData {
  id?: string | number;
  name?: string;
  protocol: string;
  parent_id?: string | number;
  level?: number;
  settings?: {
    [key: string]: string;
  };
  libraries?: LibraryWithSettingsData[];
  self_test_results?: SelfTestsData;
  goal?: string;
}

export interface ServicesData {
  protocols: ProtocolData[];
  allLibraries?: LibraryData[];
}

export interface ServicesWithRegistrationsData extends ServicesData {
  libraryRegistrations?: LibraryRegistrationData[];
}

export interface CollectionData extends ServiceData {}

export interface CollectionsData extends ServicesWithRegistrationsData {
  collections: CollectionData[];
}

export interface PathFor {
  (collectionUrl: string, bookUrl: string, tab?: string): string;
}

export interface AdminRoleData {
  library?: string;
  role: string;
}

export interface IndividualAdminData {
  email: string;
  password?: string;
  roles?: AdminRoleData[];
}

export interface IndividualAdminsData {
  individualAdmins?: IndividualAdminData[];
  allLibraries?: LibraryData[];
}

export interface PatronAuthServiceData extends ServiceData {}

export interface PatronAuthServicesData extends ServicesData {
  patron_auth_services: PatronAuthServiceData[];
}

export interface PatronData {
  authorization_expires: string | number;
  authorization_identifier: string | number;
  authorization_identifiers: string[];
  block_reason: string;
  email_address?: string;
  external_type: string;
  fines: string;
  permanent_id: string;
  personal_name?: string;
  username?: string;
}

export interface MetadataServiceData extends ServiceData {}

export interface MetadataServicesData extends ServicesData {
  metadata_services: MetadataServiceData[];
}

export interface CatalogServiceData extends ServiceData {}

export interface CatalogServicesData extends ServicesData {
  catalog_services: CatalogServiceData[];
}

export interface DiscoveryServiceData extends ServiceData {}

export interface DiscoveryServicesData extends ServicesWithRegistrationsData {
  discovery_services: DiscoveryServiceData[];
}

export interface LibraryDataWithStatus extends LibraryData {
  status: string;
  stage?: string;
}

export interface LibraryRegistrationData {
  id: string | number;
  libraries: LibraryDataWithStatus[];
  access_problem?: ProblemDetail;
  terms_of_service_html?: string;
  terms_of_service_link?: string;
}

export interface ProblemDetail {
  status: number;
  title: string;
  type: string;
  detail: string;
}

export interface LibraryRegistrationsData {
  library_registrations: LibraryRegistrationData[];
}

export interface CustomListData {
  id?: string | number;
  is_owner: boolean;
  is_shared: boolean;
  name: string;
  entry_count?: number;
  collections?: CollectionData[];
}

export interface CustomListsData {
  custom_lists: CustomListData[];
}

export interface CustomListsSetting extends SettingData {
  custom_lists?: CustomListData[];
  menuOptions?: JSX.Element[];
  menuTitle?: string;
}

export interface LaneData {
  id: string | number;
  display_name: string;
  visible: boolean;
  count: number;
  sublanes: LaneData[];
  custom_list_ids: number[];
  inherit_parent_restrictions: boolean;
}

export interface LanesData {
  lanes: LaneData[];
}

export interface AnnouncementData {
  id: string;
  content: string;
  start: string;
  finish: string;
}

export interface SitewideAnnouncementsData {
  announcements: AnnouncementData[];
  settings: SettingData[];
}

export interface AdvancedSearchQuery {
  id?: string;
  key?: string;
  op?: string;
  value?: string;
  and?: AdvancedSearchQuery[];
  or?: AdvancedSearchQuery[];
  not?: AdvancedSearchQuery[];
}

export interface AdvancedSearchData {
  query: AdvancedSearchQuery;
}

export interface QuickSightEmbeddedURLData {
  embedUrl: string;
}
