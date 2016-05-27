import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import buildStore from "./store";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import { PathFor } from "./interfaces";
import * as qs from "qs";

require("bootstrap/dist/css/bootstrap.css");
require("font-awesome/css/font-awesome.min.css");

class CirculationWeb {

  constructor(config) {
    let div = document.createElement("div");
    div.id = "opds-catalog";
    document.getElementsByTagName("body")[0].appendChild(div);

    let ContextProvider = React.createClass({
      childContextTypes: {
        editorStore: React.PropTypes.object.isRequired,
        pathFor: React.PropTypes.func.isRequired,
        csrfToken: React.PropTypes.string.isRequired,
        homeUrl: React.PropTypes.string.isRequired
      },
      getChildContext: () => {
        return {
          editorStore: buildStore(),
          pathFor: (collectionUrl: string, bookUrl: string, tab?: string) => {
            let path = "/admin/web";
            path += collectionUrl ? `/collection/${encodeURIComponent(collectionUrl)}` : "";
            path += bookUrl ? `/book/${encodeURIComponent(bookUrl)}` : "";
            path += tab ? `/tab/${tab}` : "";
            return path;
          },
          csrfToken: config.csrfToken,
          homeUrl: config.homeUrl
        };
      },
      render: function() {
        return this.props.children;
      }
    });

    let editorPath = "/admin/web(/collection/:collectionUrl)(/book/:bookUrl)(/tab/:tab)";

    function render() {
      ReactDOM.render(
        <ContextProvider>
          <Router history={browserHistory}>
            <Route path={editorPath} component={Root} />
            <Route path="/admin/web/dashboard" component={Dashboard} />
          </Router>
        </ContextProvider>,
        document.getElementById("opds-catalog")
      );
    }

    render();
  }
}

export = CirculationWeb;