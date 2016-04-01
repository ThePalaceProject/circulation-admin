import * as React from "react";
import TabContainer from "./TabContainer";

export default class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
  context: EditorContext;

  static contextTypes = {
    csrfToken: React.PropTypes.string.isRequired,
    tab: React.PropTypes.string,
    navigate: React.PropTypes.func.isRequired,
    refreshBook: React.PropTypes.func.isRequired,
    editorStore: React.PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <div className="bookDetailsContainer" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
        <TabContainer
          book={this.props.book.url}
          collection={this.props.collection}
          tab={this.context.tab}
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
          refreshBook={this.context.refreshBook}
          navigate={this.context.navigate}>
          { this.props.children }
        </TabContainer>
      </div>
    );
  }
}