import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import * as jsdom from "jsdom";

import CatalogHandler from "../CatalogHandler";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";

describe("CatalogHandler", () => {
  let wrapper;
  let params;
  let context;
  let child;
  let host = "http://example.com";

  beforeEach(() => {
    (jsdom as any).changeURL(window, host + "/test");
    params = {
      collectionUrl: "collectionurl",
      bookUrl: "bookurl",
      tab: "tab"
    };
    context = {
      homeUrl: "home url"
    };
    wrapper = shallow(
      <CatalogHandler
        params={params}
        />,
      { context }
    );
  });

  it("renders OPDSCatalog", () => {
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal(host + "/collectionurl");
    expect(catalog.prop("bookUrl")).to.equal(host + "/works/bookurl");
    expect(catalog.prop("BookDetailsContainer").name).to.equal("BookDetailsContainer");
    expect(catalog.prop("Header").name).to.equal("Header");
    expect(catalog.prop("computeBreadcrumbs")).to.be.ok;
    let pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).to.equal("Circulation Manager - Book");
    expect(pageTitleTemplate("Collection", null)).to.equal("Circulation Manager - Collection");
  });

  it("uses home url as default collection url", () => {
    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null, tab: null });
    wrapper.setProps({ params: newParams });
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal("home url");
  });

  it("includes tab in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.tab).to.equal("tab");
  });
});