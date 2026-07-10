import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

// Setup for the legacy enzyme + chai + sinon tests under `src/**/__tests__/`.
// Replaces what `src/testHelper.ts` did for mocha. Delete alongside the last
// enzyme test.

configure({ adapter: new Adapter() });

// Unhandled promise rejections are tolerated for these tests — see the comment in
// `legacyJsdomEnvironment.js`. It cannot be done from here: jest hands test code a
// *copy* of `process`, so a listener registered in this file never reaches the real
// one that Node checks before throwing.
