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

export interface CustomListsProps extends React.Props<CustomListsProps> {
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
  lists: CustomListData[];
  searchResults: CollectionData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
  fetchCustomLists: (library: string) => Promise<CustomListsData>;
  editCustomList: (library: string, data: FormData) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
}

export interface CustomListsState {
  sort: string;
}

export class CustomLists extends React.Component<CustomListsProps, CustomListsState> {
  constructor(props) {
    super(props);
    this.editCustomList = this.editCustomList.bind(this);
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
                  { this.sortedLists().map(list =>
                      <li key={list.id}>
                        <Link
                          to={"/admin/web/lists/" + this.props.library + "/edit/" + list.id}
                          >{ list.name }
                        </Link>
                      </li>
                    )
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
              searchResults={this.props.searchResults}
              />
          }

          { this.customListToEdit() &&
            <CustomListEditor
              csrfToken={this.props.csrfToken}
              library={this.props.library}
              list={this.customListToEdit()}
              editCustomList={this.editCustomList}
              search={this.props.search}
              searchResults={this.props.searchResults}
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

  changeSort() {
    const oldSort = this.state.sort;
    if (oldSort === "asc") {
      this.setState({ sort: "desc" });
    } else {
      this.setState({ sort: "asc" });
    }
  }

  sortedLists() {
    return (this.props.lists || []).sort((a, b) => {
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
    await this.props.editCustomList(this.props.library, data);
    this.props.fetchCustomLists(this.props.library);
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
    fetchError: state.editor.customLists.fetchError,
    isFetching: state.editor.customLists.isFetching || state.editor.customLists.isEditing,
    searchResults: state.editor.collection && state.editor.collection.data
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher({ adapter });
  let actions = new ActionCreator(fetcher);
  return {
    fetchCustomLists: (library: string) => dispatch(actions.fetchCustomLists(library)),
    editCustomList: (library: string, data: FormData) => dispatch(actions.editCustomList(library, data)),
    search: (url: string) => dispatch(actions.fetchCollection(url))
  };
}

const ConnectedCustomLists = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(CustomLists);

export default ConnectedCustomLists;