import * as React from "react";
import "../stylesheets/tab_container.scss";
import { Store } from "redux";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { connect } from "react-redux";
import Editor from "./Editor";
import Classifications from "./Classifications";
import Complaints from "./Complaints";
import { BookData, Navigate, PathFor } from "../interfaces";
import { State } from "../reducers/index";

export interface TabContainerProps extends React.Props<TabContainerProps> {
  bookUrl: string;
  bookData?: BookData;
  collectionUrl: string;
  store: Store<State>;
  csrfToken: string;
  tab: string;
  refreshCatalog: () => Promise<any>;
  complaintsCount?: number;
  clearBook?: () => void;
}

export interface TabContainerContext {
  pathFor: PathFor;
  router: any;
}

export class TabContainer extends React.Component<TabContainerProps, any> {
  context: TabContainerContext;

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.currentTab = this.currentTab.bind(this);
    this.tabClass = this.tabClass.bind(this);
    this.tabDisplayName = this.tabDisplayName.bind(this);
    this.renderTab = this.renderTab.bind(this);
  }

  static contextTypes: React.ValidationMap<TabContainerContext> = {
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    let showComplaintCount = (typeof this.props.complaintsCount !== "undefined");
    let complaintsTitle = "Complaints" + (showComplaintCount ? " (" + this.props.complaintsCount + ")" : "");

    return (
      <div className="book-tabs">
        <ul className="nav nav-tabs">
          { ["details", "edit", "classifications", "complaints"].map(name =>
            <li key={name} role="presentation" className={this.tabClass(name)}>
              <a
                href="javascript:void(0)"
                onClick={this.handleSelect}
                data-tabkey={name}>
                {this.tabDisplayName(name)}
              </a>
            </li>
          ) }
        </ul>

        <div className="book-tab-content">
          { this.renderTab("details",
            <div className="details">
              { this.props.children }
            </div>
          ) }

          { this.renderTab("edit",
            <Editor
              store={this.props.store}
              csrfToken={this.props.csrfToken}
              bookUrl={this.props.bookUrl}
              refreshCatalog={this.props.refreshCatalog}
              />
          ) }

          { this.renderTab("classifications",
            <Classifications
              store={this.props.store}
              csrfToken={this.props.csrfToken}
              bookUrl={this.props.bookUrl}
              book={this.props.bookData}
              refreshCatalog={this.props.refreshCatalog}
              />
          ) }

          { this.renderTab("complaints",
            <Complaints
              store={this.props.store}
              csrfToken={this.props.csrfToken}
              bookUrl={this.props.bookUrl}
              book={this.props.bookData}
              refreshCatalog={this.props.refreshCatalog}
              />
          ) }
        </div>
      </div>
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

  handleSelect(event) {
    let tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push(this.context.pathFor(this.props.collectionUrl, this.props.bookUrl, tab));
    }
  }

  currentTab() {
    return this.props.tab || "details";
  }

  tabClass(name) {
    return this.currentTab() === name ? "active" : null;
  }

  tabDisplayName(name) {
    let capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    if (name === "complaints" && typeof this.props.complaintsCount !== "undefined") {
      capitalized += " (" + this.props.complaintsCount + ")";
    }
    return capitalized;
  };

  renderTab(name, children) {
    let display = this.currentTab() === name ? "block" : "none";
    return (
      <div style={{ display }}>
        { children }
      </div>
    );
  };
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
  let fetcher = new DataFetcher({ adapter: editorAdapter });
  let actions = new ActionCreator(fetcher);
  return {
    clearBook: () => dispatch(actions.clearBook())
  };
}

let connectOptions = { withRef: true, pure: true };
const ConnectedTabContainer = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps,
  null,
  connectOptions
)(TabContainer);

export default ConnectedTabContainer;
