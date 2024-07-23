import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import userEvent from "@testing-library/user-event";
import {
  bookEditorApiEndpoints,
  PER_LIBRARY_SUPPRESS_REL,
  PER_LIBRARY_UNSUPPRESS_REL,
} from "../../../src/features/book/bookEditorSlice";
import { BookDetailsEditor } from "../../../src/components/BookDetailsEditor";
import { expect } from "chai";
import { store } from "../../../src/store";
import * as fetchMock from "fetch-mock-jest";

describe("BookDetails", () => {
  const suppressPerLibraryLink = {
    href: "/suppress/href",
    rel: PER_LIBRARY_SUPPRESS_REL,
  };
  const unsuppressPerLibraryLink = {
    href: "/unsuppress/href",
    rel: PER_LIBRARY_UNSUPPRESS_REL,
  };

  let fetchBookData;
  let fetchRoles;
  let fetchMedia;
  let fetchLanguages;
  let postBookData;
  let dispatchProps;
  const suppressBook = jest.fn().mockImplementation((url: string) =>
    store.dispatch(
      bookEditorApiEndpoints.endpoints.suppressBook.initiate({
        url,
        csrfToken: "token",
      })
    )
  );
  const unsuppressBook = jest.fn().mockImplementation((url: string) =>
    store.dispatch(
      bookEditorApiEndpoints.endpoints.unsuppressBook.initiate({
        url,
        csrfToken: "token",
      })
    )
  );

  beforeAll(() => {
    fetchMock
      .post("/suppress/href", {
        status: 200,
        body: { message: "Successfully suppressed book availability." },
      })
      .delete("/unsuppress/href", {
        status: 200,
        body: { message: "Successfully unsuppressed book availability." },
      });
  });
  beforeEach(() => {
    fetchBookData = jest.fn();
    fetchRoles = jest.fn();
    fetchMedia = jest.fn();
    fetchLanguages = jest.fn();
    postBookData = jest.fn();
    dispatchProps = {
      fetchBookData,
      fetchRoles,
      fetchMedia,
      fetchLanguages,
      postBookData,
      suppressBook,
      unsuppressBook,
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
    fetchMock.resetHistory();
  });
  afterAll(() => {
    jest.restoreAllMocks();
    fetchMock.restore();
  });

  it("uses modal for suppress book confirmation", async () => {
    // Configure standard constructors so that RTK Query works in tests with FetchMockJest
    Object.assign(fetchMock.config, {
      fetch,
      Headers,
      Request,
      Response,
    });

    const user = userEvent.setup();

    const { getByRole, getByText, queryByRole } = renderWithProviders(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", suppressPerLibraryLink }}
        bookUrl="url"
        csrfToken="token"
        canSuppress={true}
        {...dispatchProps}
      />
    );

    // The `Hide` button should be present.
    const hideButton = getByRole("button", { name: "Hide" });

    // Clicking `Hide` should show the book suppression modal.
    await user.click(hideButton);
    getByRole("heading", { level: 4, name: "Suppressing Availability" });
    getByText(/to hide this title from your library's catalog/);
    let confirmButton = getByRole("button", { name: "Suppress Availability" });
    let cancelButton = getByRole("button", { name: "Cancel" });

    // Clicking `Cancel` should close the modal.
    await user.click(cancelButton);
    confirmButton = queryByRole("button", { name: "Suppress Availability" });
    cancelButton = queryByRole("button", { name: "Cancel" });
    expect(confirmButton).to.be.null;
    expect(cancelButton).to.be.null;

    // Clicking `Hide` again should show the modal again.
    await user.click(hideButton);
    confirmButton = getByRole("button", { name: "Suppress Availability" });

    // Clicking the confirmation button should invoke the API and show a confirmation.
    await user.click(confirmButton);
    getByRole("heading", { level: 4, name: "Result" });
    getByText(/Successfully suppressed book availability/);
    getByRole("button", { name: "Dismiss" });

    // Check that the API was invoked.
    expect(suppressBook.mock.calls.length).to.equal(1);
    expect(suppressBook.mock.calls[0][0]).to.equal("/suppress/href");
    const fetchCalls = fetchMock.calls();
    expect(fetchCalls.length).to.equal(1);
    const fetchCall = fetchCalls[0];
    const fetchOptions = fetchCalls[0][1];
    expect(fetchCall[0]).to.equal("/suppress/href");
    expect(fetchOptions["headers"]["X-CSRF-Token"]).to.contain("token");
    expect(fetchOptions["method"]).to.equal("POST");
  });
  it("uses modal for unsuppress book confirmation", async () => {
    // Configure standard constructors so that RTK Query works in tests with FetchMockJest
    Object.assign(fetchMock.config, {
      fetch,
      Headers,
      Request,
      Response,
    });

    const user = userEvent.setup();

    const { getByRole, getByText, queryByRole } = renderWithProviders(
      <BookDetailsEditor
        bookData={{ id: "id", title: "title", unsuppressPerLibraryLink }}
        bookUrl="url"
        csrfToken="token"
        canSuppress={true}
        {...dispatchProps}
      />
    );

    // The `Restore` button should be present.
    const restoreButton = getByRole("button", { name: "Restore" });

    // Clicking `Restore` should show the book un/suppression modal.
    await user.click(restoreButton);
    getByRole("heading", { level: 4, name: "Restoring Availability" });
    getByText(/to make this title visible in your library's catalog/);
    let confirmButton = getByRole("button", { name: "Restore Availability" });
    let cancelButton = getByRole("button", { name: "Cancel" });

    // Clicking `Cancel` should close the modal.
    await user.click(cancelButton);
    confirmButton = queryByRole("button", { name: "Restore Availability" });
    cancelButton = queryByRole("button", { name: "Cancel" });
    expect(confirmButton).to.be.null;
    expect(cancelButton).to.be.null;

    // Clicking `Restore` again should show the modal again.
    await user.click(restoreButton);
    confirmButton = getByRole("button", { name: "Restore Availability" });

    // Clicking the confirmation button should invoke the API and show a confirmation.
    await user.click(confirmButton);
    getByRole("heading", { level: 4, name: "Result" });
    getByText(/Successfully unsuppressed book availability/);
    getByRole("button", { name: "Dismiss" });

    // Check that the API was invoked.
    expect(unsuppressBook.mock.calls.length).to.equal(1);
    expect(unsuppressBook.mock.calls[0][0]).to.equal("/unsuppress/href");
    const fetchCalls = fetchMock.calls();
    expect(fetchCalls.length).to.equal(1);
    const fetchCall = fetchCalls[0];
    const fetchOptions = fetchCalls[0][1];
    expect(fetchCall[0]).to.equal("/unsuppress/href");
    expect(fetchOptions["headers"]["X-CSRF-Token"]).to.contain("token");
    expect(fetchOptions["method"]).to.equal("DELETE");
  });
});
