import { combineReducers } from "redux";
import book, { BookState } from "./book";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
import circulationEvents, { CirculationEventsState } from "./circulationEvents";

export interface State {
  book: BookState;
  complaints: ComplaintsState;
  classifications: ClassificationsState;
  circulationEvents: CirculationEventsState;
}

export default combineReducers<State>({
  book,
  complaints,
  classifications,
  circulationEvents
});