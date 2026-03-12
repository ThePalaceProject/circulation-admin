import { combineReducers } from "redux";
import {
  bookCoverPreviewSlice,
  BookCoverPreviewState,
} from "../features/bookMetadata/bookMetadataSlice";
import { lanesUiSlice, LanesUiState } from "../features/lanes/lanesSlice";
import customListsForBook from "./customListsForBook";
import diagnostics from "./diagnostics";
import customLists from "./customLists";
import customListDetails, {
  FetchMoreCustomListDetails,
} from "./customListDetails";
import customListEditor, { CustomListEditorState } from "./customListEditor";
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
  PatronData,
  DiagnosticsData,
  ServiceData,
} from "../interfaces";

export interface State {
  bookCoverPreview: BookCoverPreviewState;
  lanesUi: LanesUiState;
  customListsForBook: FetchEditState<CustomListsData>;
  diagnostics: FetchEditState<DiagnosticsData>;
  customLists: FetchEditState<CustomListsData>;
  customListDetails: FetchMoreCustomListDetails<CollectionData>;
  customListEditor: CustomListEditorState;
  collection: CollectionState;
  selfTests: FetchEditState<ServiceData>;
  changePassword: FetchEditState<void>;
  patronManager: FetchEditState<PatronData>;
}

export default combineReducers<State>({
  bookCoverPreview: bookCoverPreviewSlice.reducer,
  lanesUi: lanesUiSlice.reducer,
  customListsForBook,
  diagnostics,
  customLists,
  customListDetails,
  customListEditor,
  collection,
  selfTests,
  changePassword,
  patronManager,
});
