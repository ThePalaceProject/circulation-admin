import ActionCreator from "../../../src/actions";
import createRegisterLibraryReducer, {
  RegisterLibraryState,
} from "../../../src/reducers/createRegisterLibraryReducer";

describe("register-library reducer", () => {
  const initState: RegisterLibraryState = {
    isFetching: false,
    fetchError: null,
  };

  const errorState: RegisterLibraryState = {
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
  };

  const reducer = createRegisterLibraryReducer("TEST_REGISTER");

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).toStrictEqual(initState);
  });

  it("handles register library request", () => {
    const action = { type: `TEST_REGISTER_${ActionCreator.REQUEST}` };
    const newState = Object.assign({}, initState, { isFetching: true });
    expect(reducer(initState, action)).toStrictEqual(newState);
    expect(reducer(errorState, action)).toStrictEqual(newState);
  });

  it("handles register library failure", () => {
    const action = {
      type: `TEST_REGISTER_${ActionCreator.FAILURE}`,
      error: "test error",
    };
    const oldState = Object.assign({}, initState, { isFetching: true });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
    });
    expect(reducer(oldState, action)).toStrictEqual(newState);
  });

  it("handles register library success", () => {
    const action = { type: `TEST_REGISTER_${ActionCreator.SUCCESS}` };
    const oldState = Object.assign({}, initState, {
      isFetching: true,
      fetchError: "test error",
    });
    expect(reducer(oldState, action)).toStrictEqual(initState);
  });
});
