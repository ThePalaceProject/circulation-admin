export interface Navigate {
  (collectionUrl: string, bookUrl: string, tab?: string): void;
}

export interface LinkData {
  href: string;
  rel: string;
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
  editLink?: LinkData;
  issuesLink?: LinkData;
  categories?: string[];
  series?: string;
  seriesPosition?: number;
  issued?: string;
  rating?: number;
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

export interface StatsData {
  patrons: {
    total: number;
    with_active_loans: number;
    with_active_loans_or_holds: number;
    loans: number;
    holds: number;
  };
  inventory: {
    titles: number;
    licenses: number;
    available_licenses: number;
  };
  vendors: {
    overdrive?: number;
    bibliotheca?: number;
    axis360?: number;
    open_access?: number;
  };
}

export interface LibraryData {
  uuid?: string;
  name?: string;
  short_name?: string;
  settings?: {
    [key: string]: string | string[];
  };
}

export interface LibrarySettingField {
  key: string;
  label: string;
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
  default?: string | string[];
  optional?: boolean;
  randomizable?: boolean;
  type?: string;
  options?: SettingData[];
}

export interface ProtocolData {
  name: string;
  label?: string;
  description?: string;
  sitewide?: boolean;
  supports_registration?: boolean;
  settings: SettingData[];
  child_settings?: SettingData[];
  library_settings?: SettingData[];
}

export interface ServiceData {
  id?: string | number;
  name?: string;
  protocol: string;
  parent_id?: string | number;
  settings?: {
    [key: string]: string;
  };
  libraries?: LibraryWithSettingsData[];
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

export interface AdminAuthServiceData extends ServiceData {}

export interface AdminAuthServicesData extends ServicesData {
  admin_auth_services: AdminAuthServiceData[];
}

export interface IndividualAdminData {
  email: string;
  password?: string;
}

export interface IndividualAdminsData {
  individualAdmins?: IndividualAdminData[];
}

export interface PatronAuthServiceData extends ServiceData {}

export interface PatronAuthServicesData extends ServicesData {
  patron_auth_services: PatronAuthServiceData[];
}

export interface SitewideSettingData {
  key: string;
  value: string;
  description?: string;
}

export interface SitewideSettingsData {
  settings: SitewideSettingData[];
  all_settings: SettingData[];
}

export interface LoggingServiceData extends ServiceData {}

export interface LoggingServicesData extends ServicesData {
  logging_services: LoggingServiceData[];
}

export interface MetadataServiceData extends ServiceData {}

export interface MetadataServicesData extends ServicesData {
  metadata_services: MetadataServiceData[];
}

export interface AnalyticsServiceData extends ServiceData {}

export interface AnalyticsServicesData extends ServicesData {
  analytics_services: AnalyticsServiceData[];
}

export interface CDNServiceData extends ServiceData {}

export interface CDNServicesData extends ServicesData {
  cdn_services: CDNServiceData[];
}

export interface SearchServiceData extends ServiceData {}

export interface SearchServicesData extends ServicesData {
  search_services: SearchServiceData[];
}

export interface StorageServiceData extends ServiceData {}

export interface StorageServicesData extends ServicesData {
  storage_services: StorageServiceData[];
}

export interface DiscoveryServiceData extends ServiceData {}

export interface DiscoveryServicesData extends ServicesWithRegistrationsData {
  discovery_services: DiscoveryServiceData[];
}

export interface LibraryDataWithStatus extends LibraryData {
  status: string;
}

export interface LibraryRegistrationData {
  id: string | number;
  libraries: LibraryDataWithStatus[];
}

export interface LibraryRegistrationsData {
  library_registrations: LibraryRegistrationData[];
}

export interface CustomListEntryData {
  pwid: string;
  title: string;
  authors: string[];
}

export interface CustomListData {
  id?: string | number;
  name: string;
  entry_count?: number;
  collections?: CollectionData[];
}

export interface CustomListDetailsData extends CustomListData {
  entries: CustomListEntryData[];
}

export interface CustomListsData {
  custom_lists: CustomListData[];
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

export interface Media {
  type: string;
  label: string;
  active: boolean;
}
