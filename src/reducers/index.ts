import { combineReducers } from "redux";
import book from "./book";
import complaints from "./complaints";
import genres from "./genres";

export default combineReducers({
  book,
  complaints,
  genres
});