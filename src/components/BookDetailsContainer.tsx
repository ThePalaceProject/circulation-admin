import * as React from "react";
import { Tabs, Tab } from "react-bootstrap";
import Editor from "./Editor";

export default function createBookDetailsContainer(containerProps: BookDetailsContainerFactoryProps) {

  class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
    constructor(props) {
      super(props);
      this.state = { tab: containerProps.tab || "details" };
    }

    render(): JSX.Element {
      let tabContentStyle = {
        position: "absolute",
        top: "100px",
        bottom: "0",
        left: "25px",
        right: "25px"
      };

      return (
        <div className="bookDetailsContainer" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
          <Tabs activeKey={this.state.tab} animation={false} onSelect={this.handleSelect.bind(this)}>
            <Tab eventKey={"details"} title="Details">
              <div style={{ paddingTop: "2em" }}>
                { this.props.children }
              </div>
            </Tab>
            <Tab eventKey={"edit"} title="Edit">
              <div style={{ paddingTop: "2em" }}>
                <Editor
                  store={containerProps.editorStore}
                  csrfToken={containerProps.csrfToken}
                  book={this.props.book.url} />
              </div>
            </Tab>
          </Tabs>
        </div>
      );
    }

    handleSelect(tab) {
      if (this.state.tab !== tab) {
        this.setState({ tab });

        if (containerProps.onNavigate) {
          containerProps.onNavigate(this.props.collection, this.props.book.url, tab);
        }
      }
    }

    setTab(tab) {
      this.setState({ tab });
    }
  }

  return BookDetailsContainer;
}