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
import { Button, Form } from "library-simplified-reusable-components";

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
    this.save = this.save.bind(this);
    this.makeURL = this.makeURL.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="custom-list-for-book">
        { this.props.book &&
          <h2>{this.props.book.title}</h2>
        }
        <h3>Lists</h3>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        }
        <Form className="edit-form" content={[
          this.renderInputList(),
          <a href={`/admin/web/lists/${this.props.library}/create`}>Create a new list</a>
        ]} onSubmit={this.save} />
      </div>
    );
  }

  makeSelect(list) {
    return <option value={list.name} key={list.id} aria-selected={false}>{list.name}</option>;
  }

  renderInputList() {
    let allLists = this.props.allCustomLists || [];
    return (
        <ProtocolFormField
          key={"lists"}
          ref={"addList"}
          setting={{
            type: "menu",
            format: "narrow",
            key: "lists?",
            label: null,
            custom_lists: this.state.customLists,
            required: true,
            menuOptions: allLists.filter(l => l.name).map(l => this.makeSelect(l)),
            urlBase: this.makeURL
          }}
          disabled={this.props.isFetching}
          value={this.state.customLists && this.state.customLists.map(l => l.name)}
        />
    );
  }

  makeURL(listName): string {
    let list = (this.props.allCustomLists || []).find(l => l.name === listName);
    if (list) {
      return `/admin/web/lists/${this.props.library}/edit/${list.id}`;
    }
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

  componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchCustomListsForBook(this.listsUrl());
      if (!this.props.allCustomLists) {
        this.props.fetchAllCustomLists();
      }
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
