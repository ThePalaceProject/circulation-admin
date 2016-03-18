jest.dontMock("../Header");
// jest.setMock("../../images/nypl-logo-transparent.png", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6fwYAAtMBznRijrsAAAAASUVORK5CYII=");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import Header from "../Header";

class TestSearch extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="test-search">collection</div>
    );
  }
}

describe("Header", () => {
  let header;
  let renderCollectionLink;

  beforeEach(() => {
    renderCollectionLink = jest.genMockFunction();
    header = TestUtils.renderIntoDocument(
      <Header renderCollectionLink={renderCollectionLink}>
        <TestSearch />
      </Header>
    );
  });

  it("shows a logo image", () => {
    let logo = TestUtils.findRenderedDOMComponentWithTag(header, "img");
    expect(logo).toBeTruthy();
  });

  it("shows the brand name", () => {
    let brand = TestUtils.findRenderedDOMComponentWithClass(header, "navbar-brand");
    expect(brand.textContent).toBe("NYPL");
  });

  it("shows a search component", () => {
    let search = TestUtils.findRenderedComponentWithType(header, TestSearch);
    expect(search).toBeTruthy();
  })

  it("renders a link to complaints", () => {
    expect(renderCollectionLink.mock.calls.length).toBe(1);
    expect(renderCollectionLink.mock.calls[0][0]).toBe("Complaints");
    expect(renderCollectionLink.mock.calls[0][1]).toBe("/admin/complaints");
  });
});