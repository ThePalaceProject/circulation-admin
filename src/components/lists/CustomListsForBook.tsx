import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import ErrorMessage from "../shared/ErrorMessage";
import ProtocolFormField from "../config/ProtocolFormField";
import { BookData, CustomListData, CustomListsData } from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { RootState } from "../../store";
import { AppDispatch } from "../../store";
import { Link } from "react-router-dom";
import { customListsApi } from "../../features/customLists/customListsApiSlice";
import {
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/diagnostics/diagnosticsSlice";

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
  store?: Store<RootState>;
  csrfToken: string;
  refreshCatalog: () => Promise<any>;
}

export interface CustomListsForBookProps
  extends CustomListsForBookStateProps,
    CustomListsForBookDispatchProps,
    CustomListsForBookOwnProps {}

export interface CustomListsForBookState {
  customLists?: CustomListData[];
}

/** Tab on the book details page that shows custom lists a book is on and lets
    an admin add the book to lists or remove the book from lists. */
export class CustomListsForBook extends React.Component<
  CustomListsForBookProps,
  CustomListsForBookState
> {
  private addListRef = React.createRef<ProtocolFormField>();

  constructor(props: CustomListsForBookProps) {
    super(props);
    this.state = {
      customLists: this.props.customListsForBook,
    };
    this.refresh = this.refresh.bind(this);
    this.save = this.save.bind(this);
    this.makeURL = this.makeURL.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="custom-list-for-book">
        {this.props.book && <h2>{this.props.book.title}</h2>}
        <h3>Lists:</h3>
        {this.props.fetchError && (
          <ErrorMessage error={this.props.fetchError} tryAgain={this.refresh} />
        )}
        <div className="edit-form">
          {this.renderInputList()}
          {this.renderLink()}
        </div>
      </div>
    );
  }

  makeOption(list: CustomListData): JSX.Element {
    // Dropdown menu of the lists to which the book can still be added
    return (
      <option value={list.name} key={list.id} aria-selected={false}>
        {list.name}
      </option>
    );
  }

  renderLink(): JSX.Element {
    // Link to the form for creating a new list
    return (
      <div key="list-creator-link">
        <Link
          to={`/admin/web/lists/${this.props.library}/create`}
          state={{ bookTitle: this.props.book && this.props.book.title }}
        >
          Create a new list
        </Link>
        <p>
          (The book title will be automatically copied and searched on the list
          creator page.)
        </p>
      </div>
    );
  }

  renderInputList(): JSX.Element {
    // The list of lists the book is already on, and the dropdown for adding it to others
    const allLists = this.props.allCustomLists || [];
    if (allLists.length > 0) {
      return (
        <ProtocolFormField
          key="lists"
          ref={this.addListRef}
          setting={{
            menuTitle: "Select an existing list",
            type: "menu",
            format: "narrow",
            key: "lists-input",
            label: null,
            custom_lists: this.state.customLists,
            required: false,
            menuOptions: allLists
              .filter((l) => l.name)
              .map((l) => this.makeOption(l)),
            urlBase: this.makeURL,
          }}
          title="Current Lists"
          disabled={this.props.isFetching}
          value={
            this.props.customListsForBook &&
            this.props.customListsForBook.map((l) => l.name)
          }
          altValue="This book is not currently on any lists."
          onSubmit={this.save}
          onEmpty="This book has been added to all the available lists."
        />
      );
    } else {
      // Don't show the dropdown if no lists exist.
      return <p>There are no available lists.</p>;
    }
  }

  makeURL(listName: string): string {
    // Each item in the list of lists links to its list edit form
    const list = (this.props.allCustomLists || []).find(
      (l) => l.name === listName
    );
    if (list) {
      return `/admin/web/lists/${this.props.library}/edit/${list.id}`;
    }
  }

  UNSAFE_componentWillMount() {
    if (this.props.bookUrl) {
      this.props.fetchCustomListsForBook(this.listsUrl());
      if (!this.props.allCustomLists) {
        this.props.fetchAllCustomLists();
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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
    const listNames = (this.addListRef.current as ProtocolFormField).getValue();
    const url = this.listsUrl();
    const data = new (window as any).FormData();
    const lists = [];
    (listNames as string[]).map((name) => {
      const list = this.props.allCustomLists.find((x) => x.name === name);
      lists.push(list);
    });
    data.append("lists", JSON.stringify(lists));
    return this.props.editCustomListsForBook(url, data).then(this.refresh);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapStateToProps(
  state: RootState,
  ownProps: CustomListsForBookOwnProps
) {
  const listsUrl = ownProps.bookUrl.replace("works", "admin/works") + "/lists";
  const allListsResult = customListsApi.endpoints.getCustomLists.select(
    ownProps.library
  )(state);
  const forBookResult = customListsApi.endpoints.getCustomListsForBook.select(
    listsUrl
  )(state);
  return {
    allCustomLists: allListsResult.data?.custom_lists ?? undefined,
    customListsForBook: forBookResult.data?.custom_lists ?? undefined,
    isFetching: isResultFetching(forBookResult),
    fetchError: rtkErrorToFetchError(forBookResult.error),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: CustomListsForBookOwnProps
) {
  return {
    fetchAllCustomLists: async (): Promise<CustomListsData> => {
      const result = await dispatch(
        customListsApi.endpoints.getCustomLists.initiate(ownProps.library)
      );
      return (result as any).data;
    },
    fetchCustomListsForBook: async (url: string): Promise<CustomListsData> => {
      const result = await dispatch(
        customListsApi.endpoints.getCustomListsForBook.initiate(url)
      );
      return (result as any).data;
    },
    editCustomListsForBook: async (
      url: string,
      data: FormData
    ): Promise<void> => {
      await dispatch(
        customListsApi.endpoints.editCustomListsForBook.initiate({ url, data })
      );
    },
  };
}

const ConnectedCustomListsForBook = connect<
  CustomListsForBookStateProps,
  CustomListsForBookDispatchProps,
  CustomListsForBookOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(CustomListsForBook);

export default ConnectedCustomListsForBook;
