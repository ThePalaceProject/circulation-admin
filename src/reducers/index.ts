import { combineReducers } from "redux";
import {
  bookCoverPreviewSlice,
  BookCoverPreviewState,
} from "../features/bookMetadata/bookMetadataSlice";
import { lanesUiSlice, LanesUiState } from "../features/lanes/lanesSlice";
import {
  selfTestsUiSlice,
  SelfTestsUiState,
} from "../features/diagnostics/diagnosticsSlice";
import customListsForBook from "./customListsForBook";
import customLists from "./customLists";
import customListDetails, {
  FetchMoreCustomListDetails,
} from "./customListDetails";
import customListEditor, { CustomListEditorState } from "./customListEditor";
import collection, {
  CollectionState,
} from "@thepalaceproject/web-opds-client/lib/reducers/collection";
import { CollectionData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import changePassword from "./changePassword";
import { FetchEditState } from "./createFetchEditReducer";
import patronManager from "./managePatrons";
import { CustomListsData, PatronData } from "../interfaces";

export interface State {
  bookCoverPreview: BookCoverPreviewState;
  lanesUi: LanesUiState;
  selfTestsUi: SelfTestsUiState;
  customListsForBook: FetchEditState<CustomListsData>;
  customLists: FetchEditState<CustomListsData>;
  customListDetails: FetchMoreCustomListDetails<CollectionData>;
  customListEditor: CustomListEditorState;
  collection: CollectionState;
  changePassword: FetchEditState<void>;
  patronManager: FetchEditState<PatronData>;
}

export default combineReducers<State>({
  bookCoverPreview: bookCoverPreviewSlice.reducer,
  lanesUi: lanesUiSlice.reducer,
  selfTestsUi: selfTestsUiSlice.reducer,
  customListsForBook,
  customLists,
  customListDetails,
  customListEditor,
  collection,
  changePassword,
  patronManager,
});
