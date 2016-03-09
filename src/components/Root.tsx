import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSBrowser = require("opds-browser");
import { createStore, applyMiddleware } from "redux";
let thunk: any = require("redux-thunk");
import Editor from "./Editor";
import editorReducers from "../editor-reducers";

export default class Root extends React.Component<RootProps, any> {
  browser: any;
  editor: any;
  editorStore: Redux.Store;

  constructor(props) {
    super(props);
    this.state = props;
    this.editorStore = createStore(
      editorReducers,
      applyMiddleware(thunk)
    );
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
            ref={c => this.editor = c}
            store={this.editorStore}
            csrfToken={this.props.csrfToken}
            book={this.state.book} />
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