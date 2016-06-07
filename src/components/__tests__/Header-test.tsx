jest.dontMock("../Header");

import * as React from "react";
import { shallow } from "enzyme";

import Header from "../Header";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";

class TestSearch extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="test-search">collection</div>
    );
  }
}

describe("Header", () => {
  let wrapper;
  let push, context;

  beforeEach(() => {
    push = jest.genMockFunction();
    context = { homeUrl: "home url" };

    wrapper = shallow(
      <Header>
        <TestSearch />
      </Header>,
      { context }
    );
  });

  it("shows a logo image", () => {
    let logo = wrapper.find("img");
    expect(logo).toBeTruthy();
  });

  it("shows the brand name", () => {
    expect(wrapper.containsMatchingElement("NYPL")).toBe(true);
  });

  it("shows a search component", () => {
    let search = wrapper.find(TestSearch);
    expect(search).toBeTruthy();
  });

  it("shows links", () => {
    let catalogLinks = wrapper.find(CatalogLink);

    expect(catalogLinks.length).toBe(3);

    let homeLink = catalogLinks.at(0);
    expect(homeLink.prop("collectionUrl")).toBe("home url");
    expect(homeLink.prop("bookUrl")).toBe(null);
    expect(homeLink.children().text()).toBe("Catalog");

    let complaintsLink = catalogLinks.at(1);
    expect(complaintsLink.prop("collectionUrl")).toBe("/admin/complaints");
    expect(complaintsLink.prop("bookUrl")).toBe(null);
    expect(complaintsLink.children().text()).toBe("Complaints");

    let hiddenLink = catalogLinks.at(2);
    expect(hiddenLink.prop("collectionUrl")).toBe("/admin/suppressed");
    expect(hiddenLink.prop("bookUrl")).toBe(null);
    expect(hiddenLink.children().text()).toBe("Hidden Books");

    let link = wrapper.find(Link);
    expect(link.prop("to")).toBe("/admin/web/dashboard");
    expect(link.children().text()).toBe("Dashboard");
  });
});