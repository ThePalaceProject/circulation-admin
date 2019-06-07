import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import {
  CustomListData,
  CustomListsData,
  CollectionsData,
  CollectionData as AdminCollectionData,
  LibraryData,
} from "../interfaces";
import Admin from "../models/Admin";
import { FetchErrorData, CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditor from "./CustomListEditor";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import CustomListsSidebar from "./CustomListsSidebar";

export interface CustomListsStateProps {
  lists: CustomListData[];
  listDetails?: CollectionData;
  collections: AdminCollectionData[];
  responseBody?: string;
  searchResults: CollectionData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  libraries?: LibraryData[];
}

export interface CustomListsDispatchProps {
  fetchCustomLists: () => Promise<CustomListsData>;
  fetchCustomListDetails: (listId: string) => Promise<CollectionData>;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  deleteCustomList: (listId: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  fetchCollections: () => Promise<CollectionsData>;
  fetchLibraries: () => void;
}

export interface CustomListsOwnProps {
  store?: Store<State>;
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
}

export interface CustomListsProps extends React.Props<CustomListsProps>, CustomListsStateProps, CustomListsDispatchProps, CustomListsOwnProps {}

export interface CustomListsState {
  sort: string;
}

/** Body of the custom lists page, with all a library's lists shown in a left sidebar and
    a list editor on the right. */
export class CustomLists extends React.Component<CustomListsProps, CustomListsState> {
  context: { admin: Admin };

  static contextTypes = {
    admin: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.editCustomList = this.editCustomList.bind(this);
    this.deleteCustomList = this.deleteCustomList.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.getEnabledEntryPoints = this.getEnabledEntryPoints.bind(this);
    this.state = {
      sort: "asc"
    };
  }

  render(): JSX.Element {
    const enabledEntryPoints = this.getEnabledEntryPoints(this.props.libraries);
    let listCollections = [];
    let entryCount;

    if (this.props.lists) {
      this.props.lists.forEach(list => {
        if (list.id === parseInt(this.props.identifier, 10)) {
          entryCount = list.entry_count;
          listCollections = list.collections;
        }
      });
    }

    return (
      <div className="custom-lists-container">
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }
        <div className="custom-lists">
          { this.renderSidebar() }
          { this.props.editOrCreate && this.renderEditor(entryCount, listCollections) }
        </div>
      </div>
    );
  }

  renderSidebar(): JSX.Element {
    let sidebar = (
      <CustomListsSidebar
        lists={this.sortedLists()}
        library={this.props.library}
        identifier={this.props.identifier}
        isLibraryManager={this.context.admin.isLibraryManager(this.props.library)}
        deleteCustomList={this.deleteCustomList}
        changeSort={this.changeSort}
        sortOrder={this.state.sort}
      />
    );
    return sidebar;
  }

  renderEditor(entryCount, listCollections): JSX.Element {
    let editorProps = {
      collections: this.collectionsForLibrary(),
      editCustomList: this.editCustomList,
      entryPoints: this.getEnabledEntryPoints(this.props.libraries),
      isFetchingMoreCustomListEntries: this.props.isFetchingMoreCustomListEntries,
      isFetchingMoreSearchResults: this.props.isFetchingMoreSearchResults,
      library: this.props.library,
      loadMoreEntries: this.props.loadMoreEntries,
      loadMoreSearchResults: this.props.loadMoreSearchResults,
      search: this.props.search,
      searchResults: this.props.searchResults
    };
    let extraProps = this.props.editOrCreate === "create" ?
      { responseBody: this.props.responseBody } :
      { entryCount: entryCount,
        list: this.props.listDetails,
        listCollections: listCollections,
        listId: this.props.identifier
      };
    return(
      <CustomListEditor {...{...editorProps, ...extraProps}} />
    );
  }

  componentWillMount() {
    if (this.props.fetchCustomLists) {
      this.props.fetchCustomLists();
    }
    if (this.props.editOrCreate === "edit" && this.props.fetchCustomListDetails) {
      this.props.fetchCustomListDetails(this.props.identifier);
    }
    if (this.props.fetchCollections) {
      this.props.fetchCollections();
    }
    this.props.fetchLibraries();
  }

  componentWillReceiveProps(nextProps) {
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
    if (nextProps.identifier && nextProps.fetchCustomListDetails && nextProps.identifier !== this.props.identifier) {
      nextProps.fetchCustomListDetails(nextProps.identifier);
    }
  }

  changeSort() {
    const oldSort = this.state.sort;
    if (oldSort === "asc") {
      this.setState({ sort: "desc" });
    } else {
      this.setState({ sort: "asc" });
    }
  }

  sortedLists(lists?: CustomListData[]) {
    lists = lists || this.props.lists || [];
    return (lists).sort((a, b) => {
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

    libraries.forEach(lib => {
      if (lib.short_name === this.props.library) {
        library = lib;
      }
    });

    return library.settings.enabled_entry_points || [];
  }

  async editCustomList(data: FormData, listId?: string): Promise<void> {
    await this.props.editCustomList(data, listId);
    this.props.fetchCustomLists();
    if (listId) {
      this.props.fetchCustomListDetails(listId);
    }
  }

  async deleteCustomList(list: CustomListData): Promise<void> {
    const descriptionText = "Deleting this list can affect any custom lanes. If a \
      lane only contains this list, then that lane will also be deleted.";
    const confirmationText = `Delete list "${list.name}"? ${descriptionText}`;
    if (window.confirm(confirmationText)) {
      await this.props.deleteCustomList(String(list.id));
      this.props.fetchCustomLists();
    }
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
    lists: state.editor.customLists && state.editor.customLists.data && state.editor.customLists.data.custom_lists,
    listDetails: state.editor.customListDetails && state.editor.customListDetails.data,
    isFetchingMoreCustomListEntries: state.editor.customListDetails && state.editor.customListDetails.isFetchingMoreEntries,
    responseBody: state.editor.customLists && state.editor.customLists.responseBody,
    fetchError: state.editor.customLists.fetchError || state.editor.collections.fetchError,
    isFetching: state.editor.customLists.isFetching || state.editor.customLists.isEditing || state.editor.customListDetails.isFetching || state.editor.customListDetails.isEditing || !ownProps.editOrCreate || (state.editor.collection && state.editor.collection.isFetching) || state.editor.collections.isFetching,
    searchResults: state.editor.collection && state.editor.collection.data,
    isFetchingMoreSearchResults: state.editor.collection && state.editor.collection.isFetchingPage,
    collections: state.editor.collections && state.editor.collections.data && state.editor.collections.data.collections,
    libraries: state.editor.libraries.data && state.editor.libraries.data.libraries,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher({ adapter });
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchCustomLists: () => dispatch(actions.fetchCustomLists(ownProps.library)),
    fetchCustomListDetails: (listId: string) => dispatch(actions.fetchCustomListDetails(ownProps.library, listId)),
    editCustomList: (data: FormData, listId?: string) => dispatch(actions.editCustomList(ownProps.library, data, listId)),
    deleteCustomList: (listId: string) => dispatch(actions.deleteCustomList(ownProps.library, listId)),
    search: (url: string) => dispatch(actions.fetchCollection(url)),
    loadMoreSearchResults: (url: string) => dispatch(actions.fetchPage(url)),
    loadMoreEntries: (url: string) => dispatch(actions.fetchMoreCustomListEntries(url)),
    fetchCollections: () => dispatch(actions.fetchCollections()),
    fetchLibraries: () => dispatch(actions.fetchLibraries()),
  };
}

const ConnectedCustomLists = connect<CustomListsStateProps, CustomListsDispatchProps, CustomListsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CustomLists);

export default ConnectedCustomLists;
