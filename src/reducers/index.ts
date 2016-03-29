import { combineReducers } from "redux";
import book from "./book";
import complaints from "./complaints";

export default combineReducers({
  book,
  complaints
});