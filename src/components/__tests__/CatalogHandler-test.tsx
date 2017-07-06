import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import * as jsdom from "jsdom";

import CatalogHandler from "../CatalogHandler";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";
import Header from "../Header";
import BookDetailsContainer from "../BookDetailsContainer";

describe("CatalogHandler", () => {
  let wrapper;
  let params;
  let context;
  let child;
  let host = "http://example.com";

  beforeEach(() => {
    (jsdom as any).changeURL(window, host + "/test");
    params = {
      collectionUrl: "library/collectionurl",
      bookUrl: "bookurl",
      tab: "tab"
    };
    wrapper = shallow(
      <CatalogHandler
        params={params}
        />
    );
  });

  it("renders OPDSCatalog", () => {
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal(host + "/library/collectionurl");
    expect(catalog.prop("bookUrl")).to.equal(host + "/works/bookurl");
    expect(catalog.prop("BookDetailsContainer").name).to.equal(BookDetailsContainer.name);
    expect(catalog.prop("Header").name).to.equal(Header.name);
    expect(catalog.prop("computeBreadcrumbs")).to.be.ok;
    let pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).to.equal("Circulation Manager - Book");
    expect(pageTitleTemplate("Collection", null)).to.equal("Circulation Manager - Collection");
  });

  it("only renders header when there's no library", () => {
    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null, tab: null });
    wrapper.setProps({ params: newParams });
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.length).to.equal(0);
    let header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("includes tab in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.tab).to.equal("tab");
  });

  it("includes library in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.library).to.equal("library");

    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: "library/bookurl" });
    wrapper.setProps({ params: newParams });
    context = wrapper.instance().getChildContext();
    expect(context.library).to.equal("library");

    newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null });
    wrapper.setProps({ params: newParams });
    context = wrapper.instance().getChildContext();
    expect(context.library).to.equal(null);
  });
});