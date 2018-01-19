import { LanguagesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LanguagesData>(ActionCreator.LANGUAGES);