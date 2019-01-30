import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import { State } from "../reducers/index";

export default class DiagnosticsPage extends React.Component<void, void> {
  render(): JSX.Element {
    return(
      <div className="diagnostics-page">
        <Header />
        <div className="body">
          <h1>Diagnostics</h1>
        </div>
      </div>
    );
  }

  componentWillMount() {
    document.title = "Circulation Manager - Diagnostics";
  }

}
