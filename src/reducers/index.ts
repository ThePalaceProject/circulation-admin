import { combineReducers } from "redux";
import book from "./book";
import complaints from "./complaints";
import classifications from "./classifications";
import circulationEvents from "./circulationEvents";

export default combineReducers({
  book,
  complaints,
  classifications,
  circulationEvents
});