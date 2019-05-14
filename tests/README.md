## Nightwatch Tests

### Setup
To set up credentials for the tests to use, create a copy of `/tests/browser/globals.js.sample` as `/tests/browser/globals.js` and update the variables.

### Running Tests
Note: There are currently known bugs between Selenium and the Firefox test browser. The Nightwatch tests will currently not work when running `npm run test-firefox`. We recommend to only run tests in Chrome at the moment.

Run `npm run test-chrome` and `npm run test-firefox` to run tests in Chrome and Firefox, respectively. To run the tests on headless browsers of Chrome and Firefox together, run `npm run test-browser`.

### File Structure
Custom Nightwatch assertions can be found in `/tests/browser/assertions`. These extend the already available `.assert` and `.verify` assertions for any specific app related tests.

Custom Nightwatch commands can be found in `/tests/browser/commands`. These are reusable commands that we need the browser to execute often.

Page Objects can be found in `/tests/browser/pages`. They are a common end-to-end pattern used to wrap specific element selectors in pages found in an app.
