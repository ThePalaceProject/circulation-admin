import { IndividualAdminsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<IndividualAdminsData>(ActionCreator.INDIVIDUAL_ADMINS, ActionCreator.EDIT_INDIVIDUAL_ADMIN);
