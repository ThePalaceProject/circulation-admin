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
import { FetchEditState } from "./createFetchEditReducer";
import { LibrariesData, CollectionsData, AdminAuthServicesData, IndividualAdminsData } from "../interfaces";


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
  individualAdmins
});