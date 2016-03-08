import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSBrowser = require("opds-browser");
import Editor from "./Editor";

export default class Root extends React.Component<any, any> {
  browser: any;
  editor: any;

  constructor(props) {
    super(props);
    this.state = props;
  }

  render(): JSX.Element {
    return (
      <div>
        { this.state.app == "browser " &&
          <OPDSBrowser
            ref={c => this.browser = c}
            collection={this.state.collection}
            book={this.state.book}
            proxyUrl="/proxy" />
        }

        { this.state.app == "editor" &&
          <Editor
            ref={c => this.editor = c} />
        }
      </div>
    );
  }

  setCollectionAndBook(collection: string, book: string): void {
    this.setState({ collection, book });
  }

  setApp(app: string): void {
    this.setState({ app });
  }
}