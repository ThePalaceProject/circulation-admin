// jest.polyfills.js

const globalThis = window;

const { fetch, Headers, Request, Response } = require("fetch-ponyfill")();
Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Headers: { value: Headers },
  Request: { value: Request },
  Response: { value: Response, writable: true },
});
