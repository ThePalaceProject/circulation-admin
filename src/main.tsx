import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
const Browser = require("opds-browser");
import Editor from "./components/Editor";

export default class App {
  constructor(elementId: string) {
    ReactDOM.render(
      <Router history={browserHistory}>
        <Route path="/browser" component={Browser} />
        <Route path="/editor" component={Editor} />
      </Router>,
      document.getElementById(elementId)
    );
  }
}