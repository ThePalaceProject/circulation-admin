/* eslint-disable react/no-deprecated */
import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import { adapter } from "@thepalaceproject/web-opds-client/lib/OPDSDataAdapter";
import {
  AdvancedSearchQuery,
  CustomListData,
  CustomListsData,
  CollectionsData,
  CollectionData as AdminCollectionData,
  LibraryData,
  LaneData,
  LanesData,
  LanguagesData,
} from "../interfaces";
import Admin from "../models/Admin";
import {
  CustomListEditorProperties,
  CustomListEditorEntriesData,
  CustomListEditorSearchParams,
} from "../reducers/customListEditor";
import {
  FetchErrorData,
  CollectionData,
} from "@thepalaceproject/web-opds-client/lib/interfaces";
import CustomListEditor from "./CustomListEditor";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import CustomListsSidebar from "./CustomListsSidebar";

export interface CustomListsStateProps {
  customListEditorAutoUpdateStatus?: string;
  customListEditorProperties?: CustomListEditorProperties;
  customListEditorSavedName?: string;
  customListEditorSearchParams?: CustomListEditorSearchParams;
  customListEditorEntries?: CustomListEditorEntriesData;
  customListEditorIsLoaded?: boolean;
  customListEditorIsOwner?: boolean;
  customListEditorIsShared?: boolean;
  customListEditorIsSharePending?: boolean;
  customListEditorIsValid?: boolean;
  customListEditorIsModified?: boolean;
  customListEditorIsSearchModified?: boolean;
  customListEditorIsAutoUpdateEnabled?: boolean;
  customListEditorIsClearFiltersEnabled?: boolean;
  lists: CustomListData[];
  listDetails?: CollectionData;
  collections: AdminCollectionData[];
  searchResults: CollectionData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
  isFetchingSearchResults: boolean;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  libraries?: LibraryData[];
  lanes?: LaneData[];
  languages?: LanguagesData;
}

export interface CustomListsDispatchProps {
  fetchLanes: () => Promise<LanesData>;
  fetchCustomLists: () => Promise<CustomListsData>;
  fetchCustomListDetails: (listId: string) => Promise<CollectionData>;
  openCustomListEditor: (listId: string) => void;
  saveCustomListEditor: () => Promise<void>;
  resetCustomListEditor?: () => void;
  executeCustomListEditorSearch?: () => void;
  updateCustomListEditorProperty?: (name: string, value) => void;
  toggleCustomListEditorCollection?: (id: number) => void;
  updateCustomListEditorSearchParam?: (name: string, value) => void;
  addCustomListEditorAdvSearchQuery?: (
    builderName: string,
    query: AdvancedSearchQuery
  ) => void;
  updateClearFiltersFlag?: (builderName: string, value: boolean) => void;
  updateCustomListEditorAdvSearchQueryBoolean?: (
    builderName: string,
    id: string,
    bool: string
  ) => void;
  moveCustomListEditorAdvSearchQuery?: (
    builderName: string,
    id: string,
    targetId: string
  ) => void;
  removeCustomListEditorAdvSearchQuery?: (
    builderName: string,
    id: string
  ) => void;
  selectCustomListEditorAdvSearchQuery?: (
    builderName: string,
    id: string
  ) => void;
  addCustomListEditorEntry?: (id: string) => void;
  addAllCustomListEditorEntries?: () => void;
  deleteCustomListEditorEntry?: (id: string) => void;
  deleteAllCustomListEditorEntries?: () => void;
  deleteCustomList: (listId: string) => Promise<void>;
  shareCustomList?: (listId: string) => Promise<void>;
  loadMoreSearchResults: () => void;
  loadMoreEntries: () => void;
  fetchCollections: () => Promise<CollectionsData>;
  fetchLibraries: () => void;
  fetchLanguages: () => void;
}

export interface CustomListsOwnProps {
  store?: Store<State>;
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
  startingTitle?: string;
}

export interface CustomListsProps
  extends React.Props<CustomListsProps>,
    CustomListsStateProps,
    CustomListsDispatchProps,
    CustomListsOwnProps {}

export interface CustomListsState {
  filter: string;
  sort: string;
}

/** Body of the custom lists page, with all a library's lists shown in a left sidebar and
    a list editor on the right. */
export class CustomLists extends React.Component<
  CustomListsProps,
  CustomListsState
> {
  context: { admin: Admin };

  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.saveCustomListEditor = this.saveCustomListEditor.bind(this);
    this.deleteCustomList = this.deleteCustomList.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.getEnabledEntryPoints = this.getEnabledEntryPoints.bind(this);
    this.state = {
      filter: "owned",
      sort: "asc",
    };
  }

  render(): JSX.Element {
    return (
      <main className="custom-lists-container">
        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} />
        )}
        {this.props.isFetching && <LoadingIndicator />}
        <div className="custom-lists">
          {this.renderSidebar()}
          {this.props.editOrCreate && this.renderEditor()}
        </div>
      </main>
    );
  }

  renderSidebar(): JSX.Element {
    return (
      <CustomListsSidebar
        lists={this.filteredSortedLists()}
        library={this.props.library}
        identifier={this.props.identifier}
        isLibraryManager={this.context.admin.isLibraryManager(
          this.props.library
        )}
        deleteCustomList={this.deleteCustomList}
        changeSort={this.changeSort}
        sortOrder={this.state.sort}
        changeFilter={this.changeFilter}
        filter={this.state.filter}
      />
    );
  }

  renderEditor(): JSX.Element {
    const editorProps = {
      collections: this.collectionsForLibrary(),
      autoUpdateStatus: this.props.customListEditorAutoUpdateStatus,
      isAutoUpdateEnabled: this.props.customListEditorIsAutoUpdateEnabled,
      isClearFiltersEnabled: this.props.customListEditorIsClearFiltersEnabled,
      properties: this.props.customListEditorProperties,
      savedName: this.props.customListEditorSavedName,
      searchParams: this.props.customListEditorSearchParams,
      isLoaded: this.props.customListEditorIsLoaded,
      isValid: this.props.customListEditorIsValid,
      isModified: this.props.customListEditorIsModified,
      isSearchModified: this.props.customListEditorIsSearchModified,
      isOwner: this.props.customListEditorIsOwner,
      isShared: this.props.customListEditorIsShared,
      isSharePending: this.props.customListEditorIsSharePending,
      entries: this.props.customListEditorEntries,
      save: this.saveCustomListEditor,
      reset: this.props.resetCustomListEditor,
      entryPoints: this.getEnabledEntryPoints(this.props.libraries),
      isFetchingMoreCustomListEntries: this.props
        .isFetchingMoreCustomListEntries,
      isFetchingSearchResults: this.props.isFetchingSearchResults,
      isFetchingMoreSearchResults: this.props.isFetchingMoreSearchResults,
      languages: this.props.languages,
      library: this.props.libraries?.find(
        (l) => l.short_name === this.props.library
      ),
      loadMoreEntries:
        this.props.listDetails?.nextPageUrl && this.props.loadMoreEntries,
      loadMoreSearchResults:
        this.props.searchResults?.nextPageUrl &&
        this.props.loadMoreSearchResults,
      search: this.props.executeCustomListEditorSearch,
      searchResults: this.props.searchResults,
      updateProperty: this.props.updateCustomListEditorProperty,
      toggleCollection: this.props.toggleCustomListEditorCollection,
      updateSearchParam: this.props.updateCustomListEditorSearchParam,
      addAdvSearchQuery: this.props.addCustomListEditorAdvSearchQuery,
      updateClearFiltersFlag: this.props.updateClearFiltersFlag,
      updateAdvSearchQueryBoolean: this.props
        .updateCustomListEditorAdvSearchQueryBoolean,
      moveAdvSearchQuery: this.props.moveCustomListEditorAdvSearchQuery,
      removeAdvSearchQuery: this.props.removeCustomListEditorAdvSearchQuery,
      selectAdvSearchQuery: this.props.selectCustomListEditorAdvSearchQuery,
      addEntry: this.props.addCustomListEditorEntry,
      addAllEntries: this.props.addAllCustomListEditorEntries,
      deleteEntry: this.props.deleteCustomListEditorEntry,
      deleteAllEntries: this.props.deleteAllCustomListEditorEntries,
      share: () => this.props.shareCustomList?.(this.props.identifier),
    };
    const extraProps =
      this.props.editOrCreate === "create"
        ? { startingTitle: this.props.startingTitle }
        : { listId: this.props.identifier };

    return <CustomListEditor {...{ ...editorProps, ...extraProps }} />;
  }

  UNSAFE_componentWillMount() {
    const {
      editOrCreate,
      fetchCollections,
      fetchCustomListDetails,
      fetchCustomLists,
      fetchLibraries,
      fetchLanguages,
      identifier,
      openCustomListEditor,
    } = this.props;

    fetchCustomLists?.();
    openCustomListEditor?.(identifier);

    if (editOrCreate === "edit") {
      fetchCustomListDetails?.(identifier);
    }

    fetchCollections?.();
    fetchLibraries?.();
    fetchLanguages?.();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // If we've fetched lists but we're not on the edit or create page,
    // redirect to the edit page for the first list, or the create page
    // if there are no lists.

    const { editOrCreate, fetchError, lists } = nextProps;

    if (!editOrCreate && lists && !fetchError) {
      const filteredSortedLists = this.filteredSortedLists(lists);

      if (filteredSortedLists.length === 0) {
        window.location.href += "/create";
      } else {
        const firstList = filteredSortedLists[0];
        window.location.href += "/edit/" + firstList.id;
      }
    }

    const {
      identifier,
      fetchCustomListDetails,
      openCustomListEditor,
    } = nextProps;

    // If we switched lists, fetch the details for the new list.
    if (identifier !== this.props.identifier) {
      openCustomListEditor?.(identifier);

      if (identifier) {
        fetchCustomListDetails?.(identifier);
      }
    }
  }

  changeFilter(filter) {
    this.setState({ filter });
  }

  changeSort(sort) {
    this.setState({ sort });
  }

  filterLists(lists) {
    const { filter } = this.state;

    let selectedFilter = null;

    if (filter === "owned") {
      selectedFilter = (list) => list.is_owner;
    } else if (filter === "shared-in") {
      selectedFilter = (list) => !list.is_owner;
    } else if (filter === "shared-out") {
      selectedFilter = (list) => list.is_owner && list.is_shared;
    }

    return selectedFilter ? lists.filter(selectedFilter) : lists;
  }

  filteredSortedLists(lists?: CustomListData[]) {
    lists = lists || this.props.lists || [];

    return this.filterLists(lists).sort((a, b) => {
      let first = a;
      let second = b;
      if (this.state.sort === "desc") {
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

  async saveCustomListEditor() {
    const { identifier: listId } = this.props;

    await this.props.saveCustomListEditor();

    this.props.fetchCustomLists();

    if (listId) {
      this.props.fetchCustomListDetails(listId);
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
    customListEditorProperties:
      state.editor.customListEditor.properties.current,
    customListEditorSavedName:
      state.editor.customListEditor.properties.baseline.name,
    customListEditorSearchParams:
      state.editor.customListEditor.searchParams.current,
    customListEditorEntries: state.editor.customListEditor.entries,
    customListEditorAutoUpdateStatus:
      state.editor.customListEditor.autoUpdateStatus,
    customListEditorIsLoaded: state.editor.customListEditor.isLoaded,
    customListEditorIsOwner: state.editor.customListEditor.isOwner,
    customListEditorIsShared: state.editor.customListEditor.isShared,
    customListEditorIsSharePending:
      state.editor.customListEditor.isSharePending,
    customListEditorIsValid: state.editor.customListEditor.isValid,
    customListEditorIsModified: state.editor.customListEditor.isModified,
    customListEditorIsSearchModified:
      state.editor.customListEditor.isSearchModified,
    customListEditorIsAutoUpdateEnabled:
      state.editor.customListEditor.isAutoUpdateEnabled,
    customListEditorIsClearFiltersEnabled:
      state.editor.customListEditor.isClearFiltersEnabled,
    lists:
      state.editor.customLists &&
      state.editor.customLists.data &&
      state.editor.customLists.data.custom_lists,
    listDetails:
      state.editor.customListDetails && state.editor.customListDetails.data,
    isFetchingMoreCustomListEntries:
      state.editor.customListDetails &&
      state.editor.customListDetails.isFetchingMoreEntries,
    fetchError:
      state.editor.customLists.fetchError ||
      state.editor.collections.fetchError,
    isFetching:
      state.editor.customLists.isFetching ||
      state.editor.customLists.isEditing ||
      state.editor.customListDetails.isFetching ||
      state.editor.customListDetails.isEditing ||
      !ownProps.editOrCreate ||
      state.editor.collections.isFetching,
    searchResults: state.editor.collection && state.editor.collection.data,
    isFetchingSearchResults: state.editor.collection?.isFetching,
    isFetchingMoreSearchResults: state.editor.collection?.isFetchingPage,
    collections:
      state.editor.collections &&
      state.editor.collections.data &&
      state.editor.collections.data.collections,
    languages: state.editor.languages && state.editor.languages.data,
    libraries:
      state.editor.libraries.data && state.editor.libraries.data.libraries,
    lanes: state.editor.lanes.data && state.editor.lanes.data.lanes,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchCustomLists: () =>
      dispatch(actions.fetchCustomLists(ownProps.library)),
    fetchCustomListDetails: (listId: string) =>
      dispatch(actions.fetchCustomListDetails(ownProps.library, listId)),
    saveCustomListEditor: () =>
      dispatch(actions.saveCustomListEditor(ownProps.library)),
    resetCustomListEditor: () => {
      dispatch(actions.resetCustomListEditor());
      dispatch(actions.executeCustomListEditorSearch(ownProps.library));
    },
    executeCustomListEditorSearch: () =>
      dispatch(actions.executeCustomListEditorSearch(ownProps.library)),
    loadMoreSearchResults: () =>
      dispatch(actions.fetchMoreCustomListEditorSearchResults()),
    deleteCustomList: (listId: string) =>
      dispatch(actions.deleteCustomList(ownProps.library, listId)),
    shareCustomList: (listId: string) =>
      dispatch(actions.shareCustomList(ownProps.library, listId)),
    openCustomListEditor: (listId: string) =>
      dispatch(actions.openCustomListEditor(listId)),
    loadMoreEntries: () => dispatch(actions.fetchMoreCustomListEntries()),
    fetchCollections: () => dispatch(actions.fetchCollections()),
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
    fetchLanes: () => dispatch(actions.fetchLanes(ownProps.library)),
    fetchLanguages: () => dispatch(actions.fetchLanguages()),
    updateCustomListEditorProperty: (name: string, value) =>
      dispatch(actions.updateCustomListEditorProperty(name, value)),
    toggleCustomListEditorCollection: (id: number) =>
      dispatch(actions.toggleCustomListEditorCollection(id)),
    updateCustomListEditorSearchParam: (name: string, value) => {
      dispatch(actions.updateCustomListEditorSearchParam(name, value));
      dispatch(actions.executeCustomListEditorSearch(ownProps.library));
    },
    updateClearFiltersFlag: (builderName: string, value: boolean) => {
      dispatch(actions.updateClearFiltersFlag(builderName, value));
    },
    addCustomListEditorAdvSearchQuery: (
      builderName: string,
      query: AdvancedSearchQuery
    ) => {
      dispatch(actions.addCustomListEditorAdvSearchQuery(builderName, query));
      dispatch(actions.executeCustomListEditorSearch(ownProps.library));
    },
    updateCustomListEditorAdvSearchQueryBoolean: (
      builderName: string,
      id: string,
      bool: string
    ) => {
      dispatch(
        actions.updateCustomListEditorAdvSearchQueryBoolean(
          builderName,
          id,
          bool
        )
      );
      dispatch(actions.executeCustomListEditorSearch(ownProps.library));
    },
    moveCustomListEditorAdvSearchQuery: (
      builderName: string,
      id: string,
      targetId: string
    ) => {
      dispatch(
        actions.moveCustomListEditorAdvSearchQuery(builderName, id, targetId)
      );
      dispatch(actions.executeCustomListEditorSearch(ownProps.library));
    },
    removeCustomListEditorAdvSearchQuery: (builderName: string, id: string) => {
      dispatch(actions.removeCustomListEditorAdvSearchQuery(builderName, id));
      dispatch(actions.executeCustomListEditorSearch(ownProps.library));
    },
    selectCustomListEditorAdvSearchQuery: (builderName: string, id: string) =>
      dispatch(actions.selectCustomListEditorAdvSearchQuery(builderName, id)),
    addCustomListEditorEntry: (id: string) =>
      dispatch(actions.addCustomListEditorEntry(id)),
    addAllCustomListEditorEntries: () =>
      dispatch(actions.addAllCustomListEditorEntries()),
    deleteCustomListEditorEntry: (id: string) =>
      dispatch(actions.deleteCustomListEditorEntry(id)),
    deleteAllCustomListEditorEntries: () =>
      dispatch(actions.deleteAllCustomListEditorEntries()),
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
