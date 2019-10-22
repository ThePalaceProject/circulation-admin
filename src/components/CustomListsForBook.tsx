import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import ErrorMessage from "./ErrorMessage";
import ProtocolFormField from "./ProtocolFormField";
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
  constructor(props: CustomListsForBookProps) {
    super(props);
    this.state = {
      customLists: this.props.customListsForBook || []
    };
    this.refresh = this.refresh.bind(this);
    this.save = this.save.bind(this);
    this.makeURL = this.makeURL.bind(this);
    this.copyTitle = this.copyTitle.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="custom-list-for-book">
        { this.props.book &&
          <h2>{this.props.book.title}</h2>
        }
          <h3>Lists:</h3>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        }
        <div className="edit-form">
          {this.renderInputList()}
          {this.renderLink()}
        </div>
      </div>
    );
  }

  makeOption(list: CustomListData): JSX.Element {
    // Dropdown menu of the lists to which the book can still be added
    return <option value={list.name} key={list.id} aria-selected={false}>{list.name}</option>;
  }

  renderLink(): JSX.Element {
    // Link to the form for creating a new list
    return(
      <div role="button" key="list-creator-link" onClick={this.copyTitle}>
        <a href={`/admin/web/lists/${this.props.library}/create`}>Create a new list</a>
        <p>(The book title will be copied to the clipboard so that you can easily search for it on the list creator page.)</p>
      </div>
    );
  }

  copyTitle() {
    // Enable admins to paste the book title into the list creator search field
    (navigator as any).clipboard.writeText(this.props.book.title);
  }

  renderInputList(): JSX.Element {
    // The list of lists the book is already on, and the dropdown for adding it to others
    let allLists = this.props.allCustomLists || [];
    if (allLists.length > 0) {
      return (
        <ProtocolFormField
          key={"lists"}
          ref={"addList"}
          setting={{
            menuTitle: "Select an existing list",
            type: "menu",
            format: "narrow",
            key: "lists-input",
            label: null,
            custom_lists: this.state.customLists,
            required: false,
            menuOptions: allLists.filter(l => l.name).map(l => this.makeOption(l)),
            urlBase: this.makeURL
          }}
          disabled={this.props.isFetching}
          value={this.props.customListsForBook && this.props.customListsForBook.map(l => l.name)}
          altValue="This book is not currently on any lists."
          onSubmit={this.save}
        />
      );
    } else {
        // Don't show the dropdown if no lists exist.
        return <p>There are no available lists.</p>;
    }
  }

  makeURL(listName: string): string {
    // Each item in the list of lists links to its list edit form
    let list = (this.props.allCustomLists || []).find(l => l.name === listName);
    if (list) {
      return `/admin/web/lists/${this.props.library}/edit/${list.id}`;
    }
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchCustomListsForBook(this.listsUrl());
      if (!this.props.allCustomLists) {
        this.props.fetchAllCustomLists();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bookUrl !== nextProps.bookUrl) {
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

  save() {
    const listNames = (this.refs.addList as ProtocolFormField).getValue();
    const url = this.listsUrl();
    let data = new (window as any).FormData();
    let lists = [];
    listNames.map((name) => {
      let list = this.props.allCustomLists.find(x => x.name === name);
      lists.push(list);
    });
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
