import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import * as qs from "qs";

require("bootstrap/dist/css/bootstrap.css");
require("font-awesome/css/font-awesome.min.css");

class CirculationWeb {

  constructor(config) {
    let div = document.createElement("div");
    div.id = "opds-catalog";
    document.getElementsByTagName("body")[0].appendChild(div);

    let editorPath = "/admin/web(/collection/:collectionUrl)(/book/:bookUrl)(/tab/:tab)";
    let EditorHandler = React.createClass({
      render: function() {
        let { collectionUrl, bookUrl, tab } = this.props.params;
        let mergedProps = Object.assign(config, {
          collectionUrl: collectionUrl ? decodeURIComponent(collectionUrl) : (config.homeUrl || null),
          bookUrl: bookUrl ? decodeURIComponent(bookUrl) : null,
          tab: tab || null
        });
        return <Root {...mergedProps} />;
      }
    });

    let pathFor = (collectionUrl: string, bookUrl: string) => {
      var path = "/admin/web";
      path += collectionUrl ? `/collection/${encodeURIComponent(collectionUrl)}` : "";
      path += bookUrl ? `/book/${encodeURIComponent(bookUrl)}` : "";
      return path;
    };

    let DashboardHandler = React.createClass({
      childContextTypes: {
        pathFor: React.PropTypes.func.isRequired
      },
      getChildContext: function() {
        return {
          pathFor: pathFor
        };
      },
      render: function() {
        return <Dashboard />;
      }
    });

    function render() {
      ReactDOM.render(
        <Router history={browserHistory}>
          <Route path={editorPath} component={EditorHandler} />
          <Route path="/admin/web/dashboard" component={DashboardHandler} />
        </Router>,
        document.getElementById("opds-catalog")
      );
    }

    render();
  }
}

export = CirculationWeb;