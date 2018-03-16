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
import loggingServices from "./loggingServices";
import metadataServices from "./metadataServices";
import analyticsServices from "./analyticsServices";
import cdnServices from "./cdnServices";
import searchServices from "./searchServices";
import storageServices from "./storageServices";
import discoveryServices from "./discoveryServices";
import registerLibraryWithDiscoveryService from "./registerLibraryWithDiscoveryService";
import discoveryServiceLibraryRegistrations from "./discoveryServiceLibraryRegistrations";
import registerLibraryWithCollection from "./registerLibraryWithCollection";
import collectionLibraryRegistrations from "./collectionLibraryRegistrations";
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
import { RegisterLibraryState } from "./createRegisterLibraryReducer";
import {
  LibrariesData, CollectionsData, AdminAuthServicesData, IndividualAdminsData,
  PatronAuthServicesData, SitewideSettingsData, LoggingServicesData, MetadataServicesData,
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
  loggingServices: FetchEditState<LoggingServicesData>;
  metadataServices: FetchEditState<MetadataServicesData>;
  analyticsServices: FetchEditState<AnalyticsServicesData>;
  cdnServices: FetchEditState<CDNServicesData>;
  searchServices: FetchEditState<SearchServicesData>;
  storageServices: FetchEditState<StorageServicesData>;
  discoveryServices: FetchEditState<DiscoveryServicesData>;
  registerLibraryWithDiscoveryService: RegisterLibraryState;
  discoveryServiceLibraryRegistrations: FetchEditState<LibraryRegistrationsData>;
  registerLibraryWithCollection: RegisterLibraryState;
  collectionLibraryRegistrations: FetchEditState<LibraryRegistrationsData>;
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
  loggingServices,
  metadataServices,
  analyticsServices,
  cdnServices,
  searchServices,
  storageServices,
  discoveryServices,
  registerLibraryWithDiscoveryService,
  discoveryServiceLibraryRegistrations,
  registerLibraryWithCollection,
  collectionLibraryRegistrations,
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
