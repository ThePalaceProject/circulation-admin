"use strict";

const JSDOMEnvironment = require("jest-environment-jsdom").default;

const warnUnhandledRejection = (reason) => {
  console.warn("Unhandled promise rejection in a legacy test:", reason);
};

/**
 * jsdom environment for the legacy enzyme tests. Delete it with the last one.
 *
 * Two things it restores that `src/testHelper.ts` used to provide under mocha:
 *
 * 1. `global.jsdom`. A handful of tests call `global.jsdom.reconfigure({ url })` to
 *    change the page origin mid-test. `history.replaceState` is not a substitute —
 *    they navigate across origins (`http://example.com`), which it cannot do.
 *
 * 2. Tolerance for unhandled promise rejections. Several suites stub a `fetch` that
 *    rejects, and nothing awaits the result; the rejection surfaces after the test
 *    has already passed. Mocha shrugged those off because its runner keeps an
 *    `unhandledRejection` listener installed, and Node only throws when there are
 *    none. Under jest they kill the worker and take the whole suite with them.
 *
 *    Re-arming has to happen on the `teardown` event, not in the constructor.
 *    `jest-circus/globalErrorHandlers` reads `process.listeners()` off the sandbox's
 *    *copied* `process` (always empty) but calls `removeAllListeners()` on the real
 *    one. So any listener registered earlier is dropped at `setup` and "restored"
 *    from an empty list, leaving zero listeners during the post-run window where
 *    these rejections actually land.
 *
 *    Scoping this to the legacy environment keeps the modern `tests/jest/` suite
 *    strict: jest clears listeners at each file's `setup`, and nothing re-arms one
 *    for a project that does not use this environment.
 */
module.exports = class LegacyJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.jsdom = this.dom;
  }

  handleTestEvent(event) {
    if (
      event.name === "teardown" &&
      process.listenerCount("unhandledRejection") === 0
    ) {
      process.on("unhandledRejection", warnUnhandledRejection);
    }
  }
};
