jest.dontMock("../Header");
// jest.setMock("../../images/nypl-logo-transparent.png", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6fwYAAtMBznRijrsAAAAASUVORK5CYII=");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import Header from "../Header";
import HeaderCollectionLink from "opds-browser/lib/components/HeaderCollectionLink";

class TestSearch extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="test-search">collection</div>
    );
  }
}

describe("Header", () => {
  let header;
  let navigate;

  beforeEach(() => {
    navigate = jest.genMockFunction();

    class FakeContext extends React.Component<any, any> {
      static childContextTypes = {
        navigate: React.PropTypes.func.isRequired,
        pathFor: React.PropTypes.func.isRequired
      };

      getChildContext() {
        return {
          navigate: navigate,
          pathFor: jest.genMockFunction()
        };
      }

      render(): JSX.Element {
        return (
          <div>{ this.props.children }</div>
        );
      }
    }

    header = TestUtils.renderIntoDocument(
      <FakeContext>
        <Header CollectionLink={HeaderCollectionLink}>
          <TestSearch />
        </Header>
      </FakeContext>
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

  it("shows top-level links", () => {
    let links = TestUtils.scryRenderedComponentsWithType(header, HeaderCollectionLink);
    expect(links.length).toBe(2);
    let elements = links.map((link) => {
      return ReactDOM.findDOMNode(link);
    });
    TestUtils.Simulate.click(elements[0]);
    expect(navigate.mock.calls.length).toBe(1);
    expect(navigate.mock.calls[0][0]).toBe("/admin/complaints");
    expect(navigate.mock.calls[0][1]).toBe(null);

    TestUtils.Simulate.click(elements[1]);
    expect(navigate.mock.calls.length).toBe(2);
    expect(navigate.mock.calls[1][0]).toBe("/admin/suppressed");
    expect(navigate.mock.calls[1][1]).toBe(null);
  });
});