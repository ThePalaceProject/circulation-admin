import * as React from "react";
import * as ReactDOM from "react-dom";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { connect } from "react-redux";
import { Tabs, Tab } from "react-bootstrap";
import Editor from "./Editor";
import Classifications from "./Classifications";
import Complaints from "./Complaints";
import { BookData, Navigate } from "../interfaces";

export interface TabContainerProps extends React.Props<TabContainerProps> {
  bookUrl: string;
  bookData?: BookData;
  collectionUrl: string;
  store: Redux.Store;
  csrfToken: string;
  tab: string;
  refreshCatalog: () => Promise<any>;
  complaintsCount?: number;
  clearBook?: () => void;
}

export class TabContainer extends React.Component<TabContainerProps, any> {
  render(): JSX.Element {
    let showComplaintCount = (typeof this.props.complaintsCount !== "undefined");
    let complaintsTitle = "Complaints" + (showComplaintCount ? " (" + this.props.complaintsCount + ")" : "");

    return (
      <Tabs activeKey={this.props.tab || "details"} animation={false} onSelect={this.handleSelect.bind(this)}>
        <Tab eventKey={"details"} title="Details">
          <div style={{ paddingTop: "2em" }}>
            { this.props.children }
          </div>
        </Tab>
        <Tab eventKey={"edit"} title="Edit">
          <Editor
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            bookUrl={this.props.bookUrl}
            refreshCatalog={this.props.refreshCatalog}
            />
        </Tab>
        <Tab eventKey={"classifications"} title="Classifications">
          <Classifications
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            bookUrl={this.props.bookUrl}
            book={this.props.bookData}
            refreshCatalog={this.props.refreshCatalog}
            />
        </Tab>
        <Tab eventKey={"complaints"} title={complaintsTitle}>
          <Complaints
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            bookUrl={this.props.bookUrl}
            book={this.props.bookData}
            refreshCatalog={this.props.refreshCatalog}
            />
        </Tab>
      </Tabs>
    );
  }

  componentWillUnmount() {
    this.props.clearBook();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.bookUrl !== this.props.bookUrl) {
      this.props.clearBook();
    }
  }

  handleSelect(tab) {
    // if (this.props.navigate) {
    //   this.props.navigate(this.props.collectionUrl, this.props.bookUrl, tab);
    // }
  }
}

function mapStateToProps(state, ownProps) {
  let complaintsCount;

  if (state.editor.complaints.data) {
    complaintsCount = Object.keys(state.editor.complaints.data).reduce((result, type) => {
      return result + state.editor.complaints.data[type];
    }, 0);
  } else {
    complaintsCount = undefined;
  }

  return {
    complaintsCount: complaintsCount,
    bookData: state.editor.book.data
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    clearBook: () => dispatch(actions.clearBook())
  };
}

let connectOptions = { withRef: true, pure: true };
const ConnectedTabContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  connectOptions
)(TabContainer);

export default ConnectedTabContainer;
