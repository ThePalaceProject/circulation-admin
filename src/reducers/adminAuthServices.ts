import { AdminAuthServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<AdminAuthServicesData>(ActionCreator.ADMIN_AUTH_SERVICES, ActionCreator.EDIT_ADMIN_AUTH_SERVICE);
