/**
 * Service configuration and self-test types.
 * These types describe the various configurable services (patron auth,
 * metadata, collections, discovery, etc.) and their self-test result data.
 */

import {
  LibraryData,
  LibraryWithSettingsData,
  LibraryDataWithStatus,
} from "./library";

export type SpecificSettingType =
  | "color-picker"
  | "date"
  | "date-picker"
  | "image"
  | "list"
  | "menu"
  | "select"
  | "text"
  | "textarea";

export interface SettingData {
  key: string;
  label: string;
  description?: string;
  default?: string | string[] | Record<string, unknown>[];
  required?: boolean;
  randomizable?: boolean;
  hidden?: boolean;
  // TODO: Remove the `string` type once we've migrated all the settings
  //  types to the new `SpecificSettingType` type.
  type?: SpecificSettingType | string;
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
  supports_import?: boolean;
  settings: SettingData[];
  child_settings?: SettingData[];
  library_settings?: SettingData[];
}

export interface SelfTestsException {
  class: string;
  debug_message?: string;
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

export interface ProblemDetail {
  status: number;
  title: string;
  type: string;
  detail: string;
}

export interface LibraryRegistrationData {
  id: string | number;
  libraries: LibraryDataWithStatus[];
  access_problem?: ProblemDetail;
  terms_of_service_html?: string;
  terms_of_service_link?: string;
}

export interface LibraryRegistrationsData {
  library_registrations: LibraryRegistrationData[];
}

export interface ServicesWithRegistrationsData extends ServicesData {
  libraryRegistrations?: LibraryRegistrationData[];
}

export type CollectionData = ServiceData;

export interface CollectionsData extends ServicesWithRegistrationsData {
  collections: CollectionData[];
}

export type PatronAuthServiceData = ServiceData;

export interface PatronAuthServicesData extends ServicesData {
  patron_auth_services: PatronAuthServiceData[];
}

export type MetadataServiceData = ServiceData;

export interface MetadataServicesData extends ServicesData {
  metadata_services: MetadataServiceData[];
}

export type CatalogServiceData = ServiceData;

export interface CatalogServicesData extends ServicesData {
  catalog_services: CatalogServiceData[];
}

export type DiscoveryServiceData = ServiceData;

export interface DiscoveryServicesData extends ServicesWithRegistrationsData {
  discovery_services: DiscoveryServiceData[];
}
