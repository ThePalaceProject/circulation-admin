import OPDSBrowser = require("opds-browser");
import createBookDetailsContainer from "./BookDetailsContainer";
require("bootstrap/dist/css/bootstrap.css");

class CirculationWeb {

  constructor(csrfToken: string) {
    let div = document.createElement("div");
    div.id = "opds-browser";
    document.getElementsByTagName("body")[0].appendChild(div);

    function getParam(name) {
      let match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
      return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    };

    function serializeParams(params) {
      if (Object.keys(params).length === 0) {
        return "";
      }

      return "?" + Object.keys(params).reduce((keys, key) => {
        if (params[key]) {
          keys.push(key + "=" + encodeURIComponent(params[key]));
        }
        return keys;
      }, []).join("&");
    };

    function historyArgs(collectionUrl, bookUrl) {
      let params = {
        collection: collectionUrl,
        book: bookUrl
      };

      return [params, "", serializeParams(params)];
    }

    window.onpopstate = (event) => {
      let collection = null,
          book = null;

      if (event.state) {
        collection = event.state.collection || null;
        book = event.state.book || null;
      }

      // call loadCollectionAndBook with skipOnNavigate = true
      // so that state isn't pushed every time it's popped
      browser.loadCollectionAndBook(collection, book, true);
    };

    function pushHistory(collectionUrl, bookUrl) {
      window.history.pushState.apply(window.history, historyArgs(collectionUrl, bookUrl));
    };

    let startCollection = getParam("collection") || window.location.origin;
    let startBook = getParam("book");
    let browser = new OPDSBrowser({
      startCollection: startCollection,
      startBook: startBook,
      onNavigate: pushHistory,
      pathFor: function (collectionUrl, bookUrl) {
        return serializeParams({collection: collectionUrl, book: bookUrl});
      },
      BookDetailsContainer: createBookDetailsContainer(csrfToken)
    }, "opds-browser");

    if (startCollection || startBook) {
      window.history.replaceState.apply(window.history, historyArgs(startCollection, startBook));
    }
  }
}

export = CirculationWeb;
