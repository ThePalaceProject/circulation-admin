import { combineReducers } from "redux";
import book, { BookState } from "./book";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
import customListsForBook from "./customListsForBook";
import circulationEvents, { CirculationEventsState } from "./circulationEvents";
import stats, { StatsState } from "./stats";
import libraries from "./libraries";
import collections from "./collections";
import adminAuthServices from "./adminAuthServices";
import individualAdmins from "./individualAdmins";
import patronAuthServices from "./patronAuthServices";
import sitewideSettings from "./sitewideSettings";
import metadataServices from "./metadataServices";
import analyticsServices from "./analyticsServices";
import cdnServices from "./cdnServices";
import searchServices from "./searchServices";
import storageServices from "./storageServices";
import discoveryServices from "./discoveryServices";
import registerLibrary, { RegisterLibraryState } from "./registerLibrary";
import libraryRegistrations from "./libraryRegistrations";
import customLists from "./customLists";
import customListDetails from "./customListDetails";
import lanes from "./lanes";
import laneVisibility from "./laneVisibility";
import resetLanes from "./resetLanes";
import roles from "./roles";
import media from "./media";
import languages from "./languages";
import collection, { CollectionState } from "opds-web-client/lib/reducers/collection";
import { FetchEditState } from "./createFetchEditReducer";
import {
  LibrariesData, CollectionsData, AdminAuthServicesData, IndividualAdminsData,
  PatronAuthServicesData, SitewideSettingsData, MetadataServicesData,
  AnalyticsServicesData, CDNServicesData, SearchServicesData, StorageServicesData,
  DiscoveryServicesData, LibraryRegistrationsData, CustomListsData,
  CustomListDetailsData, LanesData, RolesData, MediaData, LanguagesData
} from "../interfaces";


export interface State {
  book: BookState;
  complaints: ComplaintsState;
  classifications: ClassificationsState;
  customListsForBook: FetchEditState<CustomListsData>;
  circulationEvents: CirculationEventsState;
  stats: StatsState;
  libraries: FetchEditState<LibrariesData>;
  collections: FetchEditState<CollectionsData>;
  adminAuthServices: FetchEditState<AdminAuthServicesData>;
  individualAdmins: FetchEditState<IndividualAdminsData>;
  patronAuthServices: FetchEditState<PatronAuthServicesData>;
  sitewideSettings: FetchEditState<SitewideSettingsData>;
  metadataServices: FetchEditState<MetadataServicesData>;
  analyticsServices: FetchEditState<AnalyticsServicesData>;
  cdnServices: FetchEditState<CDNServicesData>;
  searchServices: FetchEditState<SearchServicesData>;
  storageServices: FetchEditState<StorageServicesData>;
  discoveryServices: FetchEditState<DiscoveryServicesData>;
  registerLibrary: RegisterLibraryState;
  libraryRegistrations: FetchEditState<LibraryRegistrationsData>;
  customLists: FetchEditState<CustomListsData>;
  customListDetails: FetchEditState<CustomListDetailsData>;
  collection: CollectionState;
  lanes: FetchEditState<LanesData>;
  laneVisibility: FetchEditState<void>;
  resetLanes: FetchEditState<void>;
  roles: FetchEditState<RolesData>;
  media: FetchEditState<MediaData>;
  languages: FetchEditState<LanguagesData>;
}

export default combineReducers<State>({
  book,
  complaints,
  classifications,
  customListsForBook,
  circulationEvents,
  stats,
  libraries,
  collections,
  adminAuthServices,
  individualAdmins,
  patronAuthServices,
  sitewideSettings,
  metadataServices,
  analyticsServices,
  cdnServices,
  searchServices,
  storageServices,
  discoveryServices,
  registerLibrary,
  libraryRegistrations,
  customLists,
  customListDetails,
  collection,
  lanes,
  laneVisibility,
  resetLanes,
  roles,
  media,
  languages
});
