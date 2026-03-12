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
import {
  patronsUiSlice,
  PatronsUiState,
} from "../features/patrons/patronsSlice";
import customLists from "./customLists";
import customListDetails, {
  FetchMoreCustomListDetails,
} from "./customListDetails";
import customListEditor, { CustomListEditorState } from "./customListEditor";
import collection, {
  CollectionState,
} from "@thepalaceproject/web-opds-client/lib/reducers/collection";
import { CollectionData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { FetchEditState } from "./createFetchEditReducer";
import { CustomListsData } from "../interfaces";

export interface State {
  bookCoverPreview: BookCoverPreviewState;
  lanesUi: LanesUiState;
  selfTestsUi: SelfTestsUiState;
  customLists: FetchEditState<CustomListsData>;
  customListDetails: FetchMoreCustomListDetails<CollectionData>;
  customListEditor: CustomListEditorState;
  collection: CollectionState;
  patronsUi: PatronsUiState;
}

export default combineReducers<State>({
  bookCoverPreview: bookCoverPreviewSlice.reducer,
  lanesUi: lanesUiSlice.reducer,
  selfTestsUi: selfTestsUiSlice.reducer,
  customLists,
  customListDetails,
  customListEditor,
  collection,
  patronsUi: patronsUiSlice.reducer,
});
