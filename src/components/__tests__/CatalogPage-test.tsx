import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import * as jsdom from "jsdom";

import CatalogPage from "../CatalogPage";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";
import Header from "../Header";
import WelcomePage from "../WelcomePage";
import BookDetailsContainer from "../BookDetailsContainer";

describe("CatalogPage", () => {
  let wrapper;
  let params;
  let context;
  let child;
  let host = "http://example.com";

  beforeEach(() => {
    (jsdom as any).changeURL(window, host + "/test");
    params = {
      collectionUrl: "library/collectionurl",
      bookUrl: "library/bookurl",
      tab: "tab"
    };
    wrapper = shallow(
      <CatalogPage
        params={params}
        />
    );
  });

  it("renders OPDSCatalog", () => {
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal(host + "/library/collectionurl");
    expect(catalog.prop("bookUrl")).to.equal(host + "/library/works/bookurl");
    expect(catalog.prop("BookDetailsContainer").name).to.equal(BookDetailsContainer.name);
    expect(catalog.prop("Header").name).to.equal(Header.name);
    expect(catalog.prop("computeBreadcrumbs")).to.be.ok;
    let pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).to.equal("Circulation Manager - Book");
    expect(pageTitleTemplate("Collection", null)).to.equal("Circulation Manager - Collection");
  });

  it("renders welcome page when there's no library", () => {
    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null, tab: null });
    wrapper.setProps({ params: newParams });
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.length).to.equal(0);
    let welcomePage = wrapper.find(WelcomePage);
    expect(welcomePage.length).to.equal(1);
  });

  it("includes tab in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.tab).to.equal("tab");
  });

  it("includes library in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.library()).to.equal("library");

    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: "library/bookurl" });
    wrapper.setProps({ params: newParams });
    context = wrapper.instance().getChildContext();
    expect(context.library()).to.equal("library");

    newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null });
    wrapper.setProps({ params: newParams });
    context = wrapper.instance().getChildContext();
    expect(context.library()).to.equal(null);
  });
});
