import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import {
  CustomListData,
  CustomListDetailsData,
  CustomListsData,
  CollectionsData,
  CollectionData as AdminCollectionData,
  MediaData,
} from "../interfaces";
import { FetchErrorData, CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditor from "./CustomListEditor";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";

export interface CustomListsStateProps {
  lists: CustomListData[];
  listDetails?: CustomListDetailsData;
  collections: AdminCollectionData[];
  editedIdentifier?: string;
  searchResults: CollectionData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
  isFetchingMoreSearchResults: boolean;
  media?: MediaData;
}

export interface CustomListsDispatchProps {
  fetchCustomLists: () => Promise<CustomListsData>;
  fetchCustomListDetails: (listId: string) => Promise<CustomListDetailsData>;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  deleteCustomList: (listId: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  fetchCollections: () => Promise<CollectionsData>;
  fetchMedia: () => void;
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
  constructor(props) {
    super(props);
    this.editCustomList = this.editCustomList.bind(this);
    this.deleteCustomList = this.deleteCustomList.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.state = {
      sort: "asc"
    };
  }

  render(): JSX.Element {
    return (
      <div className="custom-lists-container">
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }

        <div className="custom-lists">
          <div className="custom-lists-sidebar">
            <h2>List Manager</h2>
            <Link
              className="btn btn-default create-button"
              to={"/admin/web/lists/" + this.props.library + "/create"}
              >Create New List</Link>
            { this.props.lists && this.props.lists.length > 0 &&
              <div>
                <EditableInput
                  type="radio"
                  label="Sort A-Z"
                  name="sort"
                  onChange={this.changeSort}
                  checked={this.state.sort === "asc"}
                  disabled={false}
                  />
                <EditableInput
                  type="radio"
                  label="Sort Z-A"
                  name="sort"
                  onChange={this.changeSort}
                  checked={this.state.sort === "desc"}
                  disabled={false}
                  />
                <ul>
                  { this.sortedLists().map(list => {
                      const active = (String(list.id) === this.props.identifier);
                      return (
                        <li key={list.id} className={active ? "active" : "" }>
                          <div>
                            <div>{ list.name }</div>
                            <div>ID-{ list.id }</div>
                          </div>
                          <div>
                            <div>Books in list: { list.entry_count }</div>
                            <div>
                              { active &&
                                <button
                                  className="btn btn-default disabled"
                                  disabled={true}
                                  >Editing</button>
                              }
                              { !active &&
                                <Link
                                  className="btn btn-default"
                                  to={"/admin/web/lists/" + this.props.library + "/edit/" + list.id}
                                  >Edit List
                                    <PencilIcon />
                                </Link>
                              }
                              <button
                                className="btn btn-default"
                                onClick={() => this.deleteCustomList(list)}
                                >Delete List
                                  <TrashIcon />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            }
          </div>

          { this.props.editOrCreate === "create" &&
            <CustomListEditor
              library={this.props.library}
              collections={this.collectionsForLibrary()}
              editCustomList={this.editCustomList}
              search={this.props.search}
              loadMoreSearchResults={this.props.loadMoreSearchResults}
              searchResults={this.props.searchResults}
              editedIdentifier={this.props.editedIdentifier}
              isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
              media={this.props.media}
              />
          }

          { this.props.editOrCreate === "edit" &&
            <CustomListEditor
              library={this.props.library}
              list={this.props.listDetails}
              collections={this.collectionsForLibrary()}
              editCustomList={this.editCustomList}
              search={this.props.search}
              loadMoreSearchResults={this.props.loadMoreSearchResults}
              searchResults={this.props.searchResults}
              isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
              media={this.props.media}
              />
          }
        </div>
      </div>
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
    this.props.fetchMedia();
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

  async editCustomList(data: FormData, listId?: string): Promise<void> {
    await this.props.editCustomList(data, listId);
    this.props.fetchCustomLists();
  }

  async deleteCustomList(list: CustomListData): Promise<void> {
    if (window.confirm("Delete list \"" + list.name + "\"?")) {
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
    editedIdentifier: state.editor.customLists && state.editor.customLists.editedIdentifier,
    fetchError: state.editor.customLists.fetchError || state.editor.collections.fetchError,
    isFetching: state.editor.customLists.isFetching || state.editor.customLists.isEditing || state.editor.customListDetails.isFetching || state.editor.customListDetails.isEditing || !ownProps.editOrCreate || (state.editor.collection && state.editor.collection.isFetching) || state.editor.collections.isFetching,
    searchResults: state.editor.collection && state.editor.collection.data,
    isFetchingMoreSearchResults: state.editor.collection && state.editor.collection.isFetchingPage,
    collections: state.editor.collections && state.editor.collections.data && state.editor.collections.data.collections,
    media: state.editor.media.data,
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
    fetchCollections: () => dispatch(actions.fetchCollections()),
    fetchMedia: () => dispatch(actions.fetchMedia()),
  };
}

const ConnectedCustomLists = connect<CustomListsStateProps, CustomListsDispatchProps, CustomListsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CustomLists);

export default ConnectedCustomLists;
