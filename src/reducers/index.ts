import { combineReducers } from "redux";
import book, { BookState } from "./book";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
import circulationEvents, { CirculationEventsState } from "./circulationEvents";
import stats, { StatsState } from "./stats";
import libraries, { LibrariesState } from "./libraries";
import collections, { CollectionsState } from "./collections";

export interface State {
  book: BookState;
  complaints: ComplaintsState;
  classifications: ClassificationsState;
  circulationEvents: CirculationEventsState;
  stats: StatsState;
  libraries: LibrariesState;
  collections: CollectionsState;
}

export default combineReducers<State>({
  book,
  complaints,
  classifications,
  circulationEvents,
  stats,
  libraries,
  collections
});