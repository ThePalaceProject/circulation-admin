import { combineReducers } from "redux";
import complaints, { ComplaintsState } from "./complaints";
import classifications, { ClassificationsState } from "./classifications";
import bookCoverPreview, { BookCoverPreviewState } from "./bookCoverPreview";
import bookCover from "./bookCover";
import customListsForBook from "./customListsForBook";
import diagnostics from "./diagnostics";
import customLists from "./customLists";
import customListDetails, {
  FetchMoreCustomListDetails,
} from "./customListDetails";
import customListEditor, { CustomListEditorState } from "./customListEditor";
import lanes from "./lanes";
import laneVisibility from "./laneVisibility";
import resetLanes from "./resetLanes";
import laneOrder from "./laneOrder";
import selfTests from "./selfTests";
import collection, {
  CollectionState,
} from "@thepalaceproject/web-opds-client/lib/reducers/collection";
import { CollectionData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import changePassword from "./changePassword";
import { FetchEditState } from "./createFetchEditReducer";
import patronManager from "./managePatrons";
import {
  CustomListsData,
  LanesData,
  PatronData,
  DiagnosticsData,
  ServiceData,
} from "../interfaces";

export interface State {
  complaints: ComplaintsState;
  classifications: ClassificationsState;
  bookCoverPreview: BookCoverPreviewState;
  bookCover: FetchEditState<string>;
  customListsForBook: FetchEditState<CustomListsData>;
  diagnostics: FetchEditState<DiagnosticsData>;
  customLists: FetchEditState<CustomListsData>;
  customListDetails: FetchMoreCustomListDetails<CollectionData>;
  customListEditor: CustomListEditorState;
  collection: CollectionState;
  lanes: FetchEditState<LanesData>;
  laneVisibility: FetchEditState<void>;
  resetLanes: FetchEditState<void>;
  laneOrder: FetchEditState<void>;
  selfTests: FetchEditState<ServiceData>;
  changePassword: FetchEditState<void>;
  patronManager: FetchEditState<PatronData>;
}

export default combineReducers<State>({
  complaints,
  classifications,
  bookCoverPreview,
  bookCover,
  customListsForBook,
  diagnostics,
  customLists,
  customListDetails,
  customListEditor,
  collection,
  lanes,
  laneVisibility,
  resetLanes,
  laneOrder,
  selfTests,
  changePassword,
  patronManager,
});
