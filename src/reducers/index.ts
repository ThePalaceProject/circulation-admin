import { combineReducers } from "redux";
import book, { BookState } from "./book";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
import circulationEvents, { CirculationEventsState } from "./circulationEvents";
import stats, { StatsState } from "./stats";
import libraries, { LibrariesState } from "./libraries";
import collections, { CollectionsState } from "./collections";
import adminAuthServices, { AdminAuthServicesState } from "./adminAuthServices";
import individualAdmins, { IndividualAdminsState } from "./individualAdmins";

export interface State {
  book: BookState;
  complaints: ComplaintsState;
  classifications: ClassificationsState;
  circulationEvents: CirculationEventsState;
  stats: StatsState;
  libraries: LibrariesState;
  collections: CollectionsState;
  adminAuthServices: AdminAuthServicesState;
  individualAdmins: IndividualAdminsState;
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