import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import WithRemoveButton from "./WithRemoveButton";
import Autocomplete from "./Autocomplete";
import {
  BookData, CustomListData, CustomListsData
} from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { State } from "../reducers/index";

export interface CustomListsForBookStateProps {
  allCustomLists?: CustomListData[];
  customListsForBook?: CustomListData[];
  fetchError?: FetchErrorData;
  isFetching?: boolean;
}

export interface CustomListsForBookDispatchProps {
  fetchAllCustomLists?: () => Promise<CustomListsData>;
  fetchCustomListsForBook?: (url: string) => Promise<CustomListsData>;
  editCustomListsForBook?: (url: string, data: FormData) => Promise<void>;
}

export interface CustomListsForBookOwnProps {
  bookUrl: string;
  book: BookData;
  library: string;
  store?: Store<State>;
  csrfToken: string;
  refreshCatalog: () => Promise<any>;
}

export interface CustomListsForBookProps extends CustomListsForBookStateProps, CustomListsForBookDispatchProps, CustomListsForBookOwnProps {};

export interface CustomListsForBookState {
  customLists: CustomListData[];
}

/** Tab on the book details page that shows custom lists a book is on and lets
    an admin add the book to lists or remove the book from lists. */
export class CustomListsForBook extends React.Component<CustomListsForBookProps, CustomListsForBookState> {
  constructor(props) {
    super(props);
    this.state = {
      customLists: this.props.customListsForBook || []
    };
    this.refresh = this.refresh.bind(this);
    this.addList = this.addList.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.props.book &&
          <h2>{this.props.book.title}</h2>
        }
        <h3>Lists</h3>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        }

        { this.state.customLists && this.state.customLists.map(list =>
            <WithRemoveButton
              key={list.id}
              disabled={this.props.isFetching}
              onRemove={() => this.removeList(list) }
              >
              <h4>
                { list.id ?
                  <a href={"/admin/web/lists/" + this.props.library + "/edit/" + list.id}>
                    {list.name}
                  </a> :
                  list.name
                }
              </h4>
            </WithRemoveButton>
          )
        }

        { this.availableLists().length > 0 &&
          <div>
            <Autocomplete
              autocompleteValues={this.availableLists().map(list => list.name)}
              disabled={this.props.isFetching}
              name="list"
              label="Add a list"
              value=""
              ref="addList"
              />
            <button
              className="btn btn-default"
              onClick={this.addList}
              >Add</button>
          </div>
        }
      </div>
    );
  }

  availableLists(): CustomListData[] {
    const availableLists = [];
    for (const list of (this.props.allCustomLists || [])) {
      let inStateLists = false;
      for (const stateList of this.state.customLists) {
        if (stateList.id === list.id) {
          inStateLists = true;
          break;
        }
      }
      if (!inStateLists) {
        availableLists.push(list);
      }
    }
    return availableLists;
  }

  addList() {
    const lists = this.state.customLists.slice(0);
    const newListName = (this.refs["addList"] as Autocomplete).getValue();
    const newList: CustomListData = { name : newListName };
    for (const list of this.props.allCustomLists) {
      if (list.name === newListName) {
        newList.id = list.id;
        break;
      }
    }
    lists.push(newList);
    this.setState({ customLists: lists });
    this.save(lists);
  }

  removeList(list: CustomListData) {
    const newLists = [];
    for (const stateList of this.state.customLists) {
      if (stateList.id !== list.id) {
        newLists.push(stateList);
      }
    }
    this.setState({ customLists: newLists });
    this.save(newLists);
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchCustomListsForBook(this.listsUrl());
      this.props.fetchAllCustomLists();
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((this.props.bookUrl !== nextProps.bookUrl) || (!this.props.customListsForBook && nextProps.customListsForBook)) {
      this.setState({ customLists: nextProps.customListsForBook });
    }
  }

  listsUrl() {
    return this.props.bookUrl.replace("works", "admin/works") + "/lists";
  }

  refresh() {
    this.props.fetchAllCustomLists();
    this.props.fetchCustomListsForBook(this.listsUrl());
    this.props.refreshCatalog();
  }

  save(lists: CustomListData[]) {
    let url = this.listsUrl();
    let data = new (window as any).FormData();
    data.append("lists", JSON.stringify(lists));
    return this.props.editCustomListsForBook(url, data).then(this.refresh);
  }
}

function mapStateToProps(state, ownProps) {
  return {
    allCustomLists: state.editor.customLists.data && state.editor.customLists.data.custom_lists,
    customListsForBook: state.editor.customListsForBook.data && state.editor.customListsForBook.data.custom_lists,
    isFetching: state.editor.customListsForBook.isFetching,
    fetchError: state.editor.customListsForBook.fetchError
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchAllCustomLists: () => dispatch(actions.fetchCustomLists(ownProps.library)),
    fetchCustomListsForBook: (url) => dispatch(actions.fetchCustomListsForBook(url)),
    editCustomListsForBook: (url, data) => dispatch(actions.editCustomListsForBook(url, data))
  };
}

const ConnectedCustomListsForBook = connect<CustomListsForBookStateProps, CustomListsForBookDispatchProps, CustomListsForBookOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CustomListsForBook);

export default ConnectedCustomListsForBook;
