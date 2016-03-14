jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import ConnectedEditor, { Editor } from "../Editor";
import ButtonForm from "../ButtonForm";

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
});