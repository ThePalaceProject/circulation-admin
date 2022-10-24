/* eslint-disable react/no-deprecated */
import * as React from "react";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import { CollectionData, FetchErrorData } from "opds-web-client/lib/interfaces";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { Store } from "redux";

import ActionCreator from "../actions";
import {
  CollectionData as AdminCollectionData,
  CollectionsData,
  CustomListData,
  CustomListsData,
  LaneData,
  LanesData,
  LanguagesData,
  LibraryData,
} from "../interfaces";
import CustomListEditor from "./CustomListEditor";
import CustomListsSidebar from "./CustomListsSidebar";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import { State } from "../reducers/index";

export interface CustomListsStateProps {
  collections: AdminCollectionData[];
  fetchError?: FetchErrorData;
  isFetching: boolean;
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  lanes?: LaneData[];
  languages?: LanguagesData;
  libraries?: LibraryData[];
  listDetails?: CollectionData;
  lists: CustomListData[];
  responseBody?: string;
  searchResults: CollectionData;
}

export interface CustomListsDispatchProps {
  deleteCustomList: (listId: string) => Promise<void>;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  fetchCollections: () => Promise<CollectionsData>;
  fetchCustomListDetails: (listId: string) => Promise<CollectionData>;
  fetchCustomLists: () => Promise<CustomListsData>;
  fetchLanes: () => Promise<LanesData>;
  fetchLanguages: () => void;
  fetchLibraries: () => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  search: (url: string) => Promise<CollectionData>;
}

export interface CustomListsOwnProps {
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
  library: string;
  startingTitle?: string;
  store?: Store<State>;
}

export interface CustomListsProps
  extends React.Props<CustomListsProps>,
    CustomListsStateProps,
    CustomListsDispatchProps,
    CustomListsOwnProps {}

export interface CustomListsState {
  currentList: CollectionData;
  responseBodyState: string;
  isSortedAtoZ: boolean;
}

// Body of the custom lists page, with all a library's lists shown in a left
// sidebar and a list editor on the right.
export class CustomLists extends React.Component<
  CustomListsProps,
  CustomListsState
> {
  constructor(props) {
    super(props);
    this.changeSort = this.changeSort.bind(this);
    this.deleteCustomList = this.deleteCustomList.bind(this);
    this.editCustomList = this.editCustomList.bind(this);
    this.getEnabledEntryPoints = this.getEnabledEntryPoints.bind(this);
    this.resetResponseBodyState = this.resetResponseBodyState.bind(this);
    this.state = {
      currentList: this.props.listDetails,
      responseBodyState: "",
      isSortedAtoZ: true,
    };
  }

  render(): JSX.Element {
    let listCollections = [];
    let entryCount;

    if (this.props.lists) {
      this.props.lists.forEach((list) => {
        if (list.id === parseInt(this.props.identifier, 10)) {
          entryCount = list.entry_count;
          listCollections = list.collections;
        }
      });
    }

    return (
      <main className="custom-lists-container">
        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} />
        )}
        {this.props.isFetching && <LoadingIndicator />}
        <div className="custom-lists">
          {this.renderSidebar()}
          {this.props.editOrCreate &&
            this.renderEditor(entryCount, listCollections)}
        </div>
      </main>
    );
  }

  resetResponseBodyState() {
    this.setState({ responseBodyState: "" });
  }

  renderSidebar(): JSX.Element {
    return (
      <CustomListsSidebar
        changeSort={this.changeSort}
        deleteCustomList={this.deleteCustomList}
        identifier={this.props.identifier}
        isSortedAtoZ={this.state.isSortedAtoZ}
        library={this.props.library}
        lists={this.sortedLists()}
        resetResponseBodyState={this.resetResponseBodyState}
      />
    );
  }

  renderEditor(entryCount, listCollections): JSX.Element {
    const editorProps = {
      collections: this.collectionsForLibrary(),
      editCustomList: this.editCustomList,
      entryPoints: this.getEnabledEntryPoints(this.props.libraries),
      isFetchingMoreCustomListEntries: this.props
        .isFetchingMoreCustomListEntries,
      isFetchingMoreSearchResults: this.props.isFetchingMoreSearchResults,
      languages: this.props.languages,
      library: this.props.libraries?.find(
        (l) => l.short_name === this.props.library
      ),
      loadMoreEntries: this.props.loadMoreEntries,
      loadMoreSearchResults: this.props.loadMoreSearchResults,
      search: this.props.search,
      searchResults: this.props.searchResults,
    };
    const extraProps =
      this.props.editOrCreate === "create"
        ? {
            responseBody: this.state.responseBodyState,
            startingTitle: this.props.startingTitle,
          }
        : {
            entryCount: entryCount,
            list: this.state.currentList,
            listCollections: listCollections,
            listId: this.props.identifier,
          };
    return <CustomListEditor {...{ ...editorProps, ...extraProps }} />;
  }

  UNSAFE_componentWillMount() {
    if (this.props.fetchCustomLists) {
      this.props.fetchCustomLists();
    }
    if (
      this.props.editOrCreate === "edit" &&
      this.props.fetchCustomListDetails
    ) {
      this.props.fetchCustomListDetails(this.props.identifier);
    }
    if (this.props.fetchCollections) {
      this.props.fetchCollections();
    }
    this.props.fetchLibraries();
    this.props.fetchLanguages();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.listDetails) {
      this.setState({ currentList: nextProps.listDetails });
    }
    // If we've fetched lists but we're not on the edit or create page,
    // redirect to the edit page for the first list, or the create page
    // if there are no lists.
    if (!nextProps.editOrCreate && nextProps.lists && !nextProps.fetchError) {
      if (nextProps.lists.length === 0) {
        window.location.href += "/create";
      } else {
        const firstList = this.sortedLists(nextProps.lists)[0];
        window.location.href += "/edit/" + firstList.id;
      }
    }
    // If we switched lists, fetch the details for the new list.
    if (
      nextProps.identifier &&
      nextProps.fetchCustomListDetails &&
      nextProps.identifier !== this.props.identifier
    ) {
      nextProps.fetchCustomLists();
      nextProps.fetchCustomListDetails(nextProps.identifier);
    }
  }

  changeSort() {
    this.state.isSortedAtoZ
      ? this.setState({ isSortedAtoZ: false })
      : this.setState({ isSortedAtoZ: true });
  }

  sortedLists(lists?: CustomListData[]) {
    lists = lists || this.props.lists || [];
    return lists.sort((a, b) => {
      let first = a;
      let second = b;
      if (!this.state.isSortedAtoZ) {
        first = b;
        second = a;
      }

      if (first.name < second.name) {
        return -1;
      } else if (first.name === second.name) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  getEnabledEntryPoints(libraries: LibraryData[]) {
    if (!libraries) {
      return [];
    }
    let library;

    libraries.forEach((lib) => {
      if (lib.short_name === this.props.library) {
        library = lib;
      }
    });

    return library.settings.enabled_entry_points || [];
  }

  async editCustomList(data: FormData, listId?: string): Promise<void> {
    await this.props
      .editCustomList(data, listId)
      .then(() => listId && this.props.fetchCustomListDetails(listId))
      .then(() => listId && this.props.fetchCustomLists())
      .then(
        () => listId && this.setState({ currentList: this.props.listDetails })
      );
    if (this.props.responseBody) {
      this.setState({ responseBodyState: this.props.responseBody });
    }
  }

  async deleteCustomList(list: CustomListData): Promise<void> {
    const lanes = await this.getDeletedLanes(list.id);
    let deletedLanesText = "";
    if (lanes && lanes.length) {
      deletedLanesText = this.deletedLaneNames(lanes);
    }

    const confirmationText = `Delete list "${list.name}"? ${deletedLanesText}`;
    if (window.confirm(confirmationText)) {
      await this.props.deleteCustomList(String(list.id));
      this.props.fetchCustomLists();
    }
  }

  /**
   * getDeletedLanes
   * For any list id, fetch all the lanes where this list is the _only_ custom
   * list in that lane. The server will deal with deleting those lanes. Only fetch
   * the lanes data here since they are not needed for the page until a list
   * is going to be deleted.
   * @param {string | number} listId The id of the list to get associated lanes.
   */
  async getDeletedLanes(listId: string | number): Promise<LaneData[]> {
    const deletedLanes = [];
    let lanes = this.props.lanes;
    if (!lanes) {
      await this.props.fetchLanes();
      lanes = this.props.lanes;
    }

    if (lanes && lanes.length) {
      lanes.forEach((lane) => {
        const customListId = lane.custom_list_ids;
        if (customListId.length === 1 && customListId[0] === listId) {
          deletedLanes.push(lane);
        }
      });
    }
    return deletedLanes;
  }

  /**
   * deletedLaneNames
   * Display text that lists what lanes will be deleted. Currently used
   * to warn users when a list is deleted that those lanes will be deleted.
   * @param {LaneData[]} lanes Array of lanes that will be deleted.
   */
  deletedLaneNames(lanes: LaneData[]): string {
    let deleteText = "Deleting this list will delete the following lanes:\n";
    lanes.forEach(
      (lane) => (deleteText += `\nLane name: ${lane.display_name}`)
    );
    return deleteText;
  }

  collectionsForLibrary(): AdminCollectionData[] {
    const collections: AdminCollectionData[] = [];
    for (const collection of this.props.collections || []) {
      for (const library of collection.libraries || []) {
        if (library.short_name === this.props.library) {
          collections.push(collection);
          break;
        }
      }
    }
    return collections;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    collections:
      state.editor.collections &&
      state.editor.collections.data &&
      state.editor.collections.data.collections,
    fetchError:
      state.editor.customLists.fetchError ||
      state.editor.collections.fetchError,
    isFetching:
      state.editor.customLists.isFetching ||
      state.editor.customLists.isEditing ||
      state.editor.customListDetails.isFetching ||
      state.editor.customListDetails.isEditing ||
      !ownProps.editOrCreate ||
      (state.editor.collection && state.editor.collection.isFetching) ||
      state.editor.collections.isFetching,
    isFetchingMoreCustomListEntries:
      state.editor.customListDetails &&
      state.editor.customListDetails.isFetchingMoreEntries,
    isFetchingMoreSearchResults:
      state.editor.collection && state.editor.collection.isFetchingPage,
    lanes: state.editor.lanes.data && state.editor.lanes.data.lanes,
    languages: state.editor.languages && state.editor.languages.data,
    libraries:
      state.editor.libraries.data && state.editor.libraries.data.libraries,
    listDetails:
      state.editor.customListDetails && state.editor.customListDetails.data,
    lists:
      state.editor.customLists &&
      state.editor.customLists.data &&
      state.editor.customLists.data.custom_lists,
    responseBody:
      state.editor.customLists && state.editor.customLists.successMessage,
    searchResults: state.editor.collection && state.editor.collection.data,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    deleteCustomList: (listId: string) =>
      dispatch(actions.deleteCustomList(ownProps.library, listId)),
    editCustomList: (data: FormData, listId?: string) =>
      dispatch(actions.editCustomList(ownProps.library, data, listId)),
    fetchCollections: () => dispatch(actions.fetchCollections()),
    fetchCustomListDetails: (listId: string) =>
      dispatch(actions.fetchCustomListDetails(ownProps.library, listId)),
    fetchCustomLists: () =>
      dispatch(actions.fetchCustomLists(ownProps.library)),
    fetchLanes: () => dispatch(actions.fetchLanes(ownProps.library)),
    fetchLanguages: () => dispatch(actions.fetchLanguages()),
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
    loadMoreEntries: (url: string) =>
      dispatch(actions.fetchMoreCustomListEntries(url)),
    loadMoreSearchResults: (url: string) => dispatch(actions.fetchPage(url)),
    search: (url: string) => dispatch(actions.fetchCollection(url)),
  };
}

const ConnectedCustomLists = connect<
  CustomListsStateProps,
  CustomListsDispatchProps,
  CustomListsOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(CustomLists as any);

export default ConnectedCustomLists;
