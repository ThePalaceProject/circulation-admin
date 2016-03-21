import * as React from "react";
import { Tabs, Tab } from "react-bootstrap";
import Editor from "./Editor";
import Complaints from "./Complaints";

export default function createBookDetailsContainer(config: BookDetailsContainerConfig) {

  class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
    constructor(props) {
      super(props);
      this.state = { tab: config.tab || "details" };
    }

    render(): JSX.Element {
      let tabContentStyle = {
        position: "absolute",
        top: "100px",
        bottom: "0",
        left: "25px",
        right: "25px"
      };

      let showComplaintCount = typeof this.state.complaintCount !== "undefined";
      let complaintsTitle = "Complaints" + (showComplaintCount ? " (" + this.state.complaintCount + ")" : "");

      return (
        <div className="bookDetailsContainer" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
          <Tabs activeKey={this.state.tab} animation={false} onSelect={this.handleSelect.bind(this)}>
            <Tab eventKey={"details"} title="Details">
              <div style={{ paddingTop: "2em" }}>
                { this.props.children }
              </div>
            </Tab>
            <Tab eventKey={"edit"} title="Edit">
              <Editor
                store={config.editorStore}
                csrfToken={config.csrfToken}
                book={this.props.book.url}
                refreshBook={config.refreshBook} />
            </Tab>
            <Tab eventKey={"complaints"} title={complaintsTitle}>
              <Complaints
                store={config.editorStore}
                book={this.props.book}
                handleComplaintsUpdate={this.handleComplaintsUpdate.bind(this)}
                />
            </Tab>
          </Tabs>
        </div>
      );
    }

    handleSelect(tab) {
      if (this.state.tab !== tab) {
        this.setState({ tab });

        if (config.onNavigate) {
          config.onNavigate(this.props.collection, this.props.book.url, tab);
        }
      }
    }

    setTab(tab) {
      this.setState({ tab });
    }

    handleComplaintsUpdate(complaints) {
      let complaintCount = Object.keys(complaints).length;
      this.setState({ complaintCount });
    }
  }

  return BookDetailsContainer;
}