import * as React from "react";
import TabContainer from "./TabContainer";

export default function createBookDetailsContainer(config: BookDetailsContainerConfig) {

  // startTab() will return config.tab only once, when
  // BookDetailsContainer is first mounted.
  // subsequent calls should return null, so that navigation away from
  // a book and then back to a book should display the default tab instead
  // of the tab provided by the initial page load.
  let startTabCount = 0;
  let startTab = function() {
    if (startTabCount === 0) {
      startTabCount += 1;
      return config.tab || null;
    } else {
      return null;
    }
  }

  class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
    tabContainer: any;

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
          <TabContainer
            ref={c => this.tabContainer = c}
            book={this.props.book.url}
            collection={this.props.collection}
            tab={startTab()}
            store={config.editorStore}
            csrfToken={config.csrfToken}
            refreshBook={config.refreshBook}
            onNavigate={config.onNavigate}>
            { this.props.children }
          </TabContainer>
        </div>
      );
    }

    setTab(tab) {
      this.tabContainer.getWrappedInstance().setTab(tab);
    }
  }

  return BookDetailsContainer;
}