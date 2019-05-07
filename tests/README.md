## Nightwatch Tests

### Setup
To set up credentials for the tests to use, create a copy of `/tests/browser/globals.js.sample` as `/tests/browser/globals.js` and update the variables.

### Running Tests
To run them, run `npm run test-browser` which will perform tests in headless versions of Chrome and Firefox. To run them individually, run `npm run test-chrome` and `npm run test-firefox` to run tests in Chrome and Firefox, respectively.

### File Structure
Custom Nightwatch assertions can be found in `/tests/browser/assertions`. These extend the already available `.assert` and `.verify` assertions for any specific app related tests.

Custom Nightwatch commands can be found in `/tests/browser/commands`. These are reusable commands that we need the browser to execute often.

Page Objects can be found in `/tests/browser/pages`. They are a common end-to-end pattern used to wrap specific element selectors in pages found in an app.
