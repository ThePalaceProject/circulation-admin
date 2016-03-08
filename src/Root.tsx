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
    let that = this;
    let browserOnNavigate = function(collectionUrl, bookUrl) {
      return that.state.onNavigate("browser", collectionUrl, bookUrl);
    };

    return (
      <div>
        { this.state.app === "browser" &&
            <OPDSBrowser
              ref={c => this.browser = c}
              collection={this.state.collection}
              book={this.state.book}
              onNavigate={browserOnNavigate} />
        }

        { this.state.app === "editor" &&
          <Editor
            ref={c => this.editor = c} />
        }
      </div>
    );
  }

  setCollectionAndBook(collection: string, book: string): void {
    console.log(collection, book);
    this.setState({ collection, book });
  }

  setApp(app: string): void {
    this.setState({ app });
  }
}