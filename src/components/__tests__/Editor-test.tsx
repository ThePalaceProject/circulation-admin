jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import ConnectedEditor, { Editor } from "../Editor";
import ButtonForm from "../ButtonForm";
import EditForm from "../EditForm";
import ErrorMessage from "../ErrorMessage";

describe("Editor", () => {
  it("loads admin book url", () => {
    let permalink = "works/1234";
    let setBook = jest.genMockFunction();

    let editor = TestUtils.renderIntoDocument(
      <Editor book={permalink} setBook={setBook} csrfToken={"token"} />
    );

    expect(setBook.mock.calls.length).toBe(1);
    expect(setBook.mock.calls[0][0]).toBe("admin/works/1234");
  });

  it("shows title", () => {
    let setBook = jest.genMockFunction();
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title" }} book={"url"} csrfToken={"token"} setBook={setBook} />
    );

    let header = TestUtils.findRenderedDOMComponentWithTag(editor, "h2");
    expect(header.textContent).toContain("title");
  });

  it("shows button form for hide link", () => {
    let setBook = jest.genMockFunction();
    let hideLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/hide"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", hideLink: hideLink }} book={"url"} csrfToken={"token"} setBook={setBook} />
    );

    let buttonForm = TestUtils.findRenderedComponentWithType(editor, ButtonForm);
    expect(buttonForm.props.link).toEqual("href");
    expect(buttonForm.props.label).toEqual("Hide");
  });

  it("shows button form for restore link", () => {
    let setBook = jest.genMockFunction();
    let restoreLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/restore"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", restoreLink: restoreLink }} book={"url"} csrfToken={"token"} setBook={setBook} />
    );

    let buttonForm = TestUtils.findRenderedComponentWithType(editor, ButtonForm);
    expect(buttonForm.props.link).toEqual("href");
    expect(buttonForm.props.label).toEqual("Restore");
  });

  it("shows button form for refresh link", () => {
    let setBook = jest.genMockFunction();
    let refreshLink = {
      href: "href", rel: "http://librarysimplified/terms/rel/refresh"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", refreshLink: refreshLink }} book="url" csrfToken={"token"} setBook={setBook} />
    );

    let buttonForm = TestUtils.findRenderedComponentWithType(editor, ButtonForm);
    expect(buttonForm.props.link).toEqual("href");
    expect(buttonForm.props.label).toEqual("Refresh Metadata");
  });

  it("shows fetch error message", () => {
    let setBook = jest.genMockFunction();
    let fetchError = {
      status: 500,
      response: "response",
      url: ""
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title" }} book="url" csrfToken={"token"} fetchError={fetchError} setBook={setBook} />
    );

    let editFormComponents = TestUtils.scryRenderedComponentsWithType(editor, EditForm);
    expect(editFormComponents.length).toEqual(0);
    let errorMessageComponent = TestUtils.findRenderedComponentWithType(editor, ErrorMessage);
    expect(errorMessageComponent.props.error.status).toEqual(500);
  });

  it("shows edit error message with form", () => {
    let setBook = jest.genMockFunction();
    let editError = {
      status: 500,
      response: "response",
      url: ""
    };
    let editLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/edit"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", editLink: editLink }} book="url" csrfToken={"token"} editError={editError} setBook={setBook} />
    );

    let editFormComponents = TestUtils.scryRenderedComponentsWithType(editor, EditForm);
    expect(editFormComponents.length).toEqual(1);
    let errorMessageComponent = TestUtils.findRenderedComponentWithType(editor, ErrorMessage);
    expect(errorMessageComponent.props.error.status).toEqual(500);
  });
});
