jest.dontMock("../Header");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import Header from "../Header";
import HeaderBrowserLink from "opds-browser/lib/components/HeaderBrowserLink";
import { mockRouterContext } from "opds-browser/lib/components/__tests__/routing";

class TestSearch extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="test-search">collection</div>
    );
  }
}

describe("Header", () => {
  let header;
  let push, context;

  beforeEach(() => {
    push = jest.genMockFunction();
    context = mockRouterContext(push);

    class FakeContext extends React.Component<any, any> {
      static childContextTypes = {
        router: React.PropTypes.object.isRequired,
        pathFor: React.PropTypes.func.isRequired
      };

      getChildContext() {
        return context;
      }

      render(): JSX.Element {
        return (
          <div>{ this.props.children }</div>
        );
      }
    }

    header = TestUtils.renderIntoDocument(
      <FakeContext>
        <Header BrowserLink={HeaderBrowserLink}>
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
    let links = TestUtils.scryRenderedComponentsWithType(header, HeaderBrowserLink);
    let elements = links.map(link => ReactDOM.findDOMNode(link));

    expect(links.length).toBe(2);

    TestUtils.Simulate.click(elements[0], { button: 0 });
    expect(push.mock.calls.length).toBe(1);
    expect(push.mock.calls[0][0].pathname).toBe(context.pathFor("/admin/complaints", null));
    expect(push.mock.calls[0][0].state.isTopLevel).toBe(true);

    TestUtils.Simulate.click(elements[1], { button: 0 });
    expect(push.mock.calls.length).toBe(2);
    expect(push.mock.calls[1][0].pathname).toBe(context.pathFor("/admin/suppressed", null));
    expect(push.mock.calls[1][0].state.isTopLevel).toBe(true);
  });
});