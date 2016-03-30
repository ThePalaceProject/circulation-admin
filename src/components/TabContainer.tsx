import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Tabs, Tab } from "react-bootstrap";
import Editor from "./Editor";
import Complaints from "./Complaints";

export class TabContainer extends React.Component<TabContainerProps, any> {
  constructor(props) {
    super(props);
    this.state = { tab: this.props.tab || "details" };
  }

  render(): JSX.Element {
    let showComplaintCount = (typeof this.props.complaintsCount !== "undefined");
    let complaintsTitle = "Complaints" + (showComplaintCount ? " (" + this.props.complaintsCount + ")" : "");

    return (
      <Tabs activeKey={this.state.tab} animation={false} onSelect={this.handleSelect.bind(this)}>
        <Tab eventKey={"details"} title="Details">
          <div style={{ paddingTop: "2em" }}>
            { this.props.children }
          </div>
        </Tab>
        <Tab eventKey={"edit"} title="Edit">
          <Editor
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            book={this.props.book}
            refreshBook={this.props.refreshBook} />
        </Tab>
        <Tab eventKey={"complaints"} title={complaintsTitle}>
          <Complaints
            store={this.props.store}
            book={this.props.book} />
        </Tab>
      </Tabs>
    );
  }

  handleSelect(tab) {
    if (this.state.tab !== tab) {
      this.setState({ tab });

      if (this.props.navigate) {
        this.props.navigate(this.props.collection, this.props.book, tab);
      }
    }
  }

  setTab(tab) {
    this.setState({ tab });
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
    complaintsCount: complaintsCount
  };
}

let connectOptions = { withRef: true, pure: true };
const ConnectedTabContainer = connect(
  mapStateToProps,
  null,
  null,
  connectOptions
)(TabContainer);

export default ConnectedTabContainer;
