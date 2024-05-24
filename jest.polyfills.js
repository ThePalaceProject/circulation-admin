// jest.polyfills.js

const globalThis = window;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ReadableStream, TextDecoder, TextEncoder } = require("node:util");
Object.defineProperties(globalThis, {
  ReadableStream: { value: ReadableStream },
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetch, Request, Response, Headers } = require("fetch-ponyfill")();
Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Headers: { value: Headers },
  Request: { value: Request },
  Response: { value: Response, writable: true },
});
