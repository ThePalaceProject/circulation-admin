import { combineReducers } from "redux";
import book, { BookState } from "./book";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
import circulationEvents, { CirculationEventsState } from "./circulationEvents";
import stats, { StatsState } from "./stats";

export interface State {
  book: BookState;
  complaints: ComplaintsState;
  classifications: ClassificationsState;
  circulationEvents: CirculationEventsState;
  stats: StatsState;
}

export default combineReducers<State>({
  book,
  complaints,
  classifications,
  circulationEvents,
  stats
});