// jest.polyfills.js

// `jest-fixed-jsdom` gives tests Node's `fetch` classes. Node's `Request`
// rejects a relative URL such as "/admin/stats", but a browser resolves it
// against the page URL. RTK Query builds a `Request` from a relative URL, so
// resolve the input here the way a browser does: any input that is not a
// `Request` becomes a string, then a URL relative to the page.
const NodeRequest = window.Request;

class Request extends NodeRequest {
  constructor(input, init) {
    super(
      input instanceof NodeRequest
        ? input
        : new URL(String(input), window.location.href).href,
      init
    );
  }
}

window.Request = Request;
