jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import ConnectedEditor, { Editor } from "../Editor";
import ButtonForm from "../ButtonForm";
import EditForm from "../EditForm";
import ErrorMessage from "../ErrorMessage";

describe("Editor", () => {
  it("loads admin book url on mount", () => {
    let permalink = "works/1234";
    let fetchBook = jest.genMockFunction();

    let editor = TestUtils.renderIntoDocument(
      <Editor bookUrl={permalink} fetchBook={fetchBook} csrfToken={"token"} />
    );

    expect(fetchBook.mock.calls.length).toBe(1);
    expect(fetchBook.mock.calls[0][0]).toBe("admin/works/1234");
  });

  it("loads admin book url when given a new book url", () => {
    let permalink = "works/1234";
    let newPermalink = "works/5555";
    let fetchBook = jest.genMockFunction();
    let element = document.createElement("div");

    ReactDOM.render(
      <Editor bookUrl={permalink} fetchBook={fetchBook} csrfToken={"token"} />,
      element
    );

    ReactDOM.render(
      <Editor bookUrl={newPermalink} fetchBook={fetchBook} csrfToken={"token"} />,
      element
    );

    expect(fetchBook.mock.calls.length).toBe(2);
    expect(fetchBook.mock.calls[1][0]).toBe("admin/works/5555");
  });

  it("shows title", () => {
    let fetchBook = jest.genMockFunction();
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title" }} bookUrl="url" csrfToken="token" fetchBook={fetchBook} />
    );

    let header = TestUtils.findRenderedDOMComponentWithTag(editor, "h2");
    expect(header.textContent).toContain("title");
  });

  it("shows button form for hide link", () => {
    let fetchBook = jest.genMockFunction();
    let hideLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/hide"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", hideLink: hideLink }} bookUrl="url" csrfToken="token" fetchBook={fetchBook} />
    );

    let buttonForm = TestUtils.findRenderedComponentWithType(editor, ButtonForm);
    expect(buttonForm.props.link).toEqual("href");
    expect(buttonForm.props.label).toEqual("Hide");
  });

  it("shows button form for restore link", () => {
    let fetchBook = jest.genMockFunction();
    let restoreLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/restore"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", restoreLink: restoreLink }} bookUrl="url" csrfToken="token" fetchBook={fetchBook} />
    );

    let buttonForm = TestUtils.findRenderedComponentWithType(editor, ButtonForm);
    expect(buttonForm.props.link).toEqual("href");
    expect(buttonForm.props.label).toEqual("Restore");
  });

  it("shows button form for refresh link", () => {
    let fetchBook = jest.genMockFunction();
    let refreshLink = {
      href: "href", rel: "http://librarysimplified/terms/rel/refresh"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", refreshLink: refreshLink }} bookUrl="url" csrfToken="token" fetchBook={fetchBook} />
    );

    let buttonForm = TestUtils.findRenderedComponentWithType(editor, ButtonForm);
    expect(buttonForm.props.link).toEqual("href");
    expect(buttonForm.props.label).toEqual("Refresh Metadata");
  });

  it("shows fetch error message", () => {
    let fetchBook = jest.genMockFunction();
    let fetchError = {
      status: 500,
      response: "response",
      url: ""
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title" }} bookUrl="url" csrfToken="token" fetchError={fetchError} fetchBook={fetchBook} />
    );

    let editFormComponents = TestUtils.scryRenderedComponentsWithType(editor, EditForm);
    expect(editFormComponents.length).toEqual(0);
    let errorMessageComponent = TestUtils.findRenderedComponentWithType(editor, ErrorMessage);
    expect(errorMessageComponent.props.error.status).toEqual(500);
  });

  it("shows edit error message with form", () => {
    let fetchBook = jest.genMockFunction();
    let editError = {
      status: 500,
      response: "response",
      url: ""
    };
    let editLink = {
      href: "href", rel: "http://librarysimplified.org/terms/rel/edit"
    };
    let editor = TestUtils.renderIntoDocument(
      <Editor bookData={{ title: "title", editLink: editLink }} bookUrl="url" csrfToken="token" editError={editError} fetchBook={fetchBook} />
    );

    let editFormComponents = TestUtils.scryRenderedComponentsWithType(editor, EditForm);
    expect(editFormComponents.length).toEqual(1);
    let errorMessageComponent = TestUtils.findRenderedComponentWithType(editor, ErrorMessage);
    expect(errorMessageComponent.props.error.status).toEqual(500);
  });
});
