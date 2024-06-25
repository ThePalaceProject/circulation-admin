import { expect } from "chai";

// import book from "../book";
import book from "../../features/book/bookEditorSlice";
import ActionCreator from "../../actions";
import bookEditorSlice, {
  getBookData,
} from "../../features/book/bookEditorSlice";

describe("book reducer", () => {
  const initState = {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null,
    editError: null,
  };

  const fetchedState = {
    url: "test url",
    data: {
      id: "id",
      title: "test book",
    },
    isFetching: false,
    fetchError: null,
    editError: null,
  };

  // it("returns initial state for unrecognized action", () => {
  //   expect(book(undefined, {})).to.deep.equal(initState);
  // });

  // TODO: test clearBook
  it("handles CLEAR_BOOK", () => {
    const action = { type: ActionCreator.BOOK_CLEAR };
    console.log("result", book(fetchedState, action));
    expect(book(fetchedState, action)).to.deep.equal(initState);
  });

  // it("handles BOOK_ADMIN_REQUEST", () => {
  //   const action = { type: ActionCreator.BOOK_ADMIN_REQUEST, url: "test url" };
  //   const oldState = Object.assign({}, initState, { editError: "error" });
  //   const newState = Object.assign({}, initState, {
  //     url: "test url",
  //     isFetching: true,
  //     editError: null,
  //   });
  //   expect(book(initState, action)).to.deep.equal(newState);
  // });

  // TODO: test editBook
  // it("handles EDIT_BOOK_REQUEST", () => {
  //   const action = { type: ActionCreator.EDIT_BOOK_REQUEST };
  //   const newState = Object.assign({}, fetchedState, {
  //     isFetching: true,
  //   });
  //   expect(book(fetchedState, action)).to.deep.equal(newState);
  // });

  // it("handles BOOK_ADMIN_FAILURE", () => {
  //   const action = {
  //     type: ActionCreator.BOOK_ADMIN_FAILURE,
  //     error: "test error",
  //   };
  //   const oldState = {
  //     url: "test url",
  //     data: null,
  //     isFetching: true,
  //     fetchError: null,
  //     editError: null,
  //   };
  //   const newState = Object.assign({}, oldState, {
  //     fetchError: "test error",
  //     isFetching: false,
  //   });
  //   expect(book(oldState, action)).to.deep.equal(newState);
  // });

  // TODO: test editBook
  // it("handles EDIT_BOOK_FAILURE", () => {
  //   const action = {
  //     type: ActionCreator.EDIT_BOOK_FAILURE,
  //     error: "test error",
  //   };
  //   const oldState = {
  //     url: "test url",
  //     data: null,
  //     isFetching: true,
  //     fetchError: null,
  //     editError: null,
  //   };
  //   const newState = Object.assign({}, oldState, {
  //     editError: "test error",
  //     isFetching: false,
  //   });
  //   expect(book(oldState, action)).to.deep.equal(newState);
  // });

  //   it("handles BOOK_ADMIN_LOAD", () => {
  //     const action = {
  //       type: ActionCreator.BOOK_ADMIN_LOAD,
  //       data: "test data",
  //       url: "test url",
  //     };
  //     const oldState = {
  //       url: "test url",
  //       data: null,
  //       isFetching: true,
  //       fetchError: null,
  //       editError: null,
  //     };
  //     const newState = Object.assign({}, oldState, {
  //       data: "test data",
  //       isFetching: false,
  //     });
  //     expect(book(oldState, action)).to.deep.equal(newState);
  //   });
});
