// jest.polyfills.js

const globalThis = window;

// TODO: I'm not sure why we still need to override fetch here, since
//  `jest-fixed-jsdom` already does that. But not doing so causes one
//  of the tests to fail, so I'm leaving it in for now.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetch } = require("jest-fixed-jsdom");
Object.defineProperties(globalThis, {
  fetch: { value: fetch },
});
