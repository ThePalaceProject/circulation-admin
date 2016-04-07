import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Tabs, Tab } from "react-bootstrap";
import Editor from "./Editor";
import Complaints from "./Complaints";
import ActionCreator from "../actions";

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
            refreshBook={this.props.refreshBrowser}
            />
        </Tab>
        <Tab eventKey={"complaints"} title={complaintsTitle}>
          <Complaints
            store={this.props.store}
            bookUrl={this.props.bookUrl}
            book={this.props.bookData}
            postComplaint={this.props.postComplaint}
            />
        </Tab>
      </Tabs>
    );
  }

  handleSelect(tab) {
    if (this.props.navigate) {
      this.props.navigate(this.props.collectionUrl, this.props.bookUrl, false, tab);
    }
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
  let actions = new ActionCreator();

  return {
    postComplaint: (url: string, data: PostComplaintData) => dispatch(actions.postComplaint(url, data))
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