import { combineReducers } from "redux";
import book, { BookState } from "./book";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
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
import drmServices from "./drmServices";
import cdnServices from "./cdnServices";
import searchServices from "./searchServices";
import discoveryServices from "./discoveryServices";
import { FetchEditState } from "./createFetchEditReducer";
import {
  LibrariesData, CollectionsData, AdminAuthServicesData, IndividualAdminsData,
  PatronAuthServicesData, SitewideSettingsData, MetadataServicesData,
  AnalyticsServicesData, DRMServicesData, CDNServicesData, SearchServicesData,
  DiscoveryServicesData
} from "../interfaces";


export interface State {
  book: BookState;
  complaints: ComplaintsState;
  classifications: ClassificationsState;
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
  drmServices: FetchEditState<DRMServicesData>;
  cdnServices: FetchEditState<CDNServicesData>;
  searchServices: FetchEditState<SearchServicesData>;
  discoveryServices: FetchEditState<DiscoveryServicesData>;
}

export default combineReducers<State>({
  book,
  complaints,
  classifications,
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
  drmServices,
  cdnServices,
  searchServices,
  discoveryServices
});