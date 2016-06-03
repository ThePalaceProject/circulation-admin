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
      collectionUrl: "collection url",
      bookUrl: "book url",
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
    expect(catalog.prop("collectionUrl")).toBe("collection url");
    expect(catalog.prop("bookUrl")).toBe("book url");
    expect(catalog.prop("BookDetailsContainer").name).toEqual("BookDetailsContainer");
    expect(catalog.prop("Header").name).toEqual("Header");
    expect(catalog.prop("computeBreadcrumbs")).toBeTruthy();
    expect(catalog.prop("pageTitleTemplate")).toBe(wrapper.instance().pageTitleTemplate);
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