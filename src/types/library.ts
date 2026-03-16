/**
 * Library data types.
 * These types describe library records as returned by the Circulation Manager API.
 */

export interface LibraryData {
  uuid?: string;
  name?: string;
  short_name?: string;
  settings?: {
    [key: string]: string | string[] | Record<string, unknown>[];
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

export interface LibraryDataWithStatus extends LibraryData {
  status: string;
  stage?: string;
}
