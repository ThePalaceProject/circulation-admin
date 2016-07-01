jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import CatalogHandler from "../CatalogHandler";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";

describe("CatalogHandler", () => {
  let wrapper;
  let params;
  let context;
  let child;

  beforeEach(() => {
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
        csrfToken="token"
        params={params}
        />,
      { context }
    );
  });

  it("renders OPDSCatalog", () => {
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).toBe("/collectionurl");
    expect(catalog.prop("bookUrl")).toBe("/works/bookurl");
    expect(catalog.prop("BookDetailsContainer").name).toEqual("BookDetailsContainer");
    expect(catalog.prop("Header").name).toEqual("Header");
    expect(catalog.prop("computeBreadcrumbs")).toBeTruthy();
    let pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).toBe("Circulation Manager - Book");
    expect(pageTitleTemplate("Collection", null)).toBe("Circulation Manager - Collection");
  });

  it("uses home url as default collection url", () => {
    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null, tab: null });
    wrapper.setProps({ params: newParams });
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).toBe("home url");
  });

  it("includes tab in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.tab).toBe("tab");
  });
});