import ActionCreator from "../actions";
import { DiagnosticsData } from "../interfaces";

import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<DiagnosticsData>(ActionCreator.DIAGNOSTICS);
