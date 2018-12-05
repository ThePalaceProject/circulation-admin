import { CatalogServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CatalogServicesData>(ActionCreator.CATALOG_SERVICES, ActionCreator.EDIT_CATALOG_SERVICE);
