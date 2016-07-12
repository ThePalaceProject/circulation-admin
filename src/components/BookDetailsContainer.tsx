import * as React from "react";
import { Store } from "redux";
import TabContainer from "./TabContainer";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";
import { Navigate } from "../interfaces";
import { State } from "../reducers/index";

export interface BookDetailsContainerContext {
  csrfToken: string;
  tab: string;
  editorStore: Store<State>;
}

export default class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
  context: BookDetailsContainerContext;

  static contextTypes = {
    csrfToken: React.PropTypes.string.isRequired,
    tab: React.PropTypes.string,
    editorStore: React.PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <div className="bookDetailsContainer" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
        <TabContainer
          bookUrl={this.props.bookUrl}
          collectionUrl={this.props.collectionUrl}
          refreshCatalog={this.props.refreshCatalog}
          tab={this.context.tab}
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}>
          { this.props.children }
        </TabContainer>
      </div>
    );
  }
}