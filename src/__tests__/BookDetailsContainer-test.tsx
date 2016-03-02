jest.dontMock("../BookDetailsContainer");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import createBookDetailsContainer from "../BookDetailsContainer";
import { Tab } from "react-bootstrap";
import SuppressForm from "../SuppressForm";

describe("BookDetailsContainer", () => {
  let bookDetailsContainer;

  beforeEach(() => {
    let BookDetailsContainer = createBookDetailsContainer("token");
    let book = {
      title: "title",
      rawEntry: {
        links: [{
          rel: "http://librarysimplified.org/terms/rel/suppress",
          href: "href"
        }]
      }
    };
    bookDetailsContainer = TestUtils.renderIntoDocument(
      <BookDetailsContainer book={book}>
        <div className="content">content</div>
      </BookDetailsContainer>
    );
  });

  it("shows tabs", () => {
    let tabs = TestUtils.scryRenderedComponentsWithType(bookDetailsContainer, Tab);
    expect(tabs.length).toBe(2);
  });

  it("shows child content in initial tab", () => {
    let child = TestUtils.findRenderedDOMComponentWithClass(bookDetailsContainer, "content");
    expect(child.textContent).toBe("content");
  });

  it("shows suppress form", () => {
    let tabs = TestUtils.scryRenderedComponentsWithType(bookDetailsContainer, Tab);
    let suppressTab = tabs[1];
    TestUtils.Simulate.click(suppressTab);
    let form = TestUtils.findRenderedComponentWithType(bookDetailsContainer, SuppressForm);
    expect(form.props.csrfToken).toBe("token");
    expect(form.props.link).toBe("href");
  });
});