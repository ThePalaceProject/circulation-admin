// jest.polyfills.js

// `jest-fixed-jsdom` gives tests Node's `fetch` classes. Node's `Request`
// rejects a relative URL such as "/admin/stats", but a browser resolves it
// against the page URL. RTK Query builds a `Request` from a relative URL, so
// resolve string URLs here the way a browser does.
const NodeRequest = window.Request;

class Request extends NodeRequest {
  constructor(input, init) {
    super(
      typeof input === "string"
        ? new URL(input, window.location.href).href
        : input,
      init
    );
  }
}

window.Request = Request;
