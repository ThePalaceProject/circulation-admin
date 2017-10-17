import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import { CustomListData, CustomListsData } from "../interfaces";
import { FetchErrorData, CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditor from "./CustomListEditor";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import EditableRadio from "./EditableRadio";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";

export interface CustomListsProps extends React.Props<CustomListsProps> {
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
  lists: CustomListData[];
  editedIdentifier?: string;
  searchResults: CollectionData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
  isFetchingMoreSearchResults: boolean;
  fetchCustomLists: (library: string) => Promise<CustomListsData>;
  editCustomList: (library: string, data: FormData, csrfToken: string) => Promise<void>;
  deleteCustomList: (library: string, listId: string, csrfToken: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
}

export interface CustomListsState {
  sort: string;
}

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
      <div className="custom-lists-container" ref="container">
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
                <EditableRadio
                  label="Sort A-Z"
                  name="sort"
                  onChange={this.changeSort}
                  checked={this.state.sort === "asc"}
                  disabled={false}
                  />
                <EditableRadio
                  label="Sort Z-A"
                  name="sort"
                  onChange={this.changeSort}
                  checked={this.state.sort === "desc"}
                  disabled={false}
                  />
                <ul>
                  { this.sortedLists().map(list => {
                      const active = (list === this.customListToEdit());
                      return (
                        <li key={list.id} className={active ? "active" : "" }>
                          <div>
                            <div>{ list.name }</div>
                            <div>ID-{ list.id }</div>
                          </div>
                          <div>
                            <div>Books in list: { list.entries.length }</div>
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
                                onClick={() => this.deleteCustomList(String(list.id))}
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
              csrfToken={this.props.csrfToken}
              library={this.props.library}
              editCustomList={this.editCustomList}
              search={this.props.search}
              loadMoreSearchResults={this.props.loadMoreSearchResults}
              searchResults={this.props.searchResults}
              editedIdentifier={this.props.editedIdentifier}
              isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
              />
          }

          { this.customListToEdit() &&
            <CustomListEditor
              csrfToken={this.props.csrfToken}
              library={this.props.library}
              list={this.customListToEdit()}
              editCustomList={this.editCustomList}
              search={this.props.search}
              loadMoreSearchResults={this.props.loadMoreSearchResults}
              searchResults={this.props.searchResults}
              isFetchingMoreSearchResults={this.props.isFetchingMoreSearchResults}
              />
          }
        </div>
      </div>
    );
  }

  componentWillMount() {
    if (this.props.fetchCustomLists) {
      this.props.fetchCustomLists(this.props.library);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.identifier && nextProps.identifier !== this.props.identifier) {
      // We're opening the edit page for a list. Scroll back to the top.
        const container = this.refs["container"] as HTMLDivElement;
        if (container) {
          container.scrollTop = 0;
        }
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

  async editCustomList(data: FormData): Promise<void> {
    await this.props.editCustomList(this.props.library, data, this.props.csrfToken);
    this.props.fetchCustomLists(this.props.library);
  }

  async deleteCustomList(id: string): Promise<void> {
    if (window.confirm("Are you sure you want to delete list " + id + "?")) {
      await this.props.deleteCustomList(this.props.library, id, this.props.csrfToken);
      this.props.fetchCustomLists(this.props.library);
    }
  }

  customListToEdit(): CustomListData | null {
    if (this.props.editOrCreate === "edit" && this.props.lists) {
      for (const list of this.props.lists) {
        if (String(list.id) === this.props.identifier) {
          return list;
        }
      }
    }
    return null;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    lists: state.editor.customLists && state.editor.customLists.data && state.editor.customLists.data.custom_lists,
    editedIdentifier: state.editor.customLists && state.editor.customLists.editedIdentifier,
    fetchError: state.editor.customLists.fetchError,
    isFetching: state.editor.customLists.isFetching || state.editor.customLists.isEditing || !ownProps.editOrCreate || (state.editor.collection && state.editor.collection.isFetching),
    searchResults: state.editor.collection && state.editor.collection.data,
    isFetchingMoreSearchResults: state.editor.collection && state.editor.collection.isFetchingPage
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher({ adapter });
  let actions = new ActionCreator(fetcher);
  return {
    fetchCustomLists: (library: string) => dispatch(actions.fetchCustomLists(library)),
    editCustomList: (library: string, data: FormData, csrfToken: string) => dispatch(actions.editCustomList(library, data, csrfToken)),
    deleteCustomList: (library: string, listId: string, csrfToken: string) => dispatch(actions.deleteCustomList(library, listId, csrfToken)),
    search: (url: string) => dispatch(actions.fetchCollection(url)),
    loadMoreSearchResults: (url: string) => dispatch(actions.fetchPage(url))
  };
}

const ConnectedCustomLists = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(CustomLists);

export default ConnectedCustomLists;