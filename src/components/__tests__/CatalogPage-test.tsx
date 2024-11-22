import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import CatalogPage from "../CatalogPage";
import OPDSCatalog from "@thepalaceproject/web-opds-client/lib/components/OPDSCatalog";
import Header from "../Header";
import Footer from "../Footer";
import WelcomePage from "../WelcomePage";
import BookDetailsContainer from "../BookDetailsContainer";
import title from "../../utils/title";

describe("CatalogPage", () => {
  let wrapper;
  let params;
  const host = "http://example.com";

  beforeEach(() => {
    global.jsdom.reconfigure({ url: host + "/test" });
    params = {
      collectionUrl: "library/collectionurl",
      bookUrl: "library/bookurl",
      tab: "tab",
    };
    wrapper = shallow(<CatalogPage params={params} />);
  });

  it("renders OPDSCatalog", () => {
    const catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal(
      host + "/library/collectionurl"
    );
    expect(catalog.prop("bookUrl")).to.equal(host + "/library/works/bookurl");
    expect(catalog.prop("BookDetailsContainer").name).to.equal(
      BookDetailsContainer.name
    );
    expect(catalog.prop("Header").name).to.equal(Header.name);
    expect(catalog.prop("computeBreadcrumbs")).to.be.ok;
    const pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).to.equal(title("Book"));
    expect(pageTitleTemplate("Collection", null)).to.equal(title("Collection"));
  });

  it("handles the case in which the URL already contains a query string", () => {
    const queryUrl = "library/collectionurl?samplequery=test";
    expect(wrapper.instance().expandCollectionUrl(queryUrl)).to.equal(
      host + "/library/collectionurl?samplequery=test"
    );
  });

  it("renders welcome page when there's no library", () => {
    const newParams = Object.assign({}, params, {
      collectionUrl: null,
      bookUrl: null,
      tab: null,
    });
    wrapper.setProps({ params: newParams });
    const catalog = wrapper.find(OPDSCatalog);
    expect(catalog.length).to.equal(0);
    const welcomePage = wrapper.find(WelcomePage);
    expect(welcomePage.length).to.equal(1);
  });

  it("includes tab in child context", () => {
    const context = wrapper.instance().getChildContext();
    expect(context.tab).to.equal("tab");
  });

  it("includes library in child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.library()).to.equal("library");

    let newParams = Object.assign({}, params, {
      collectionUrl: null,
      bookUrl: "library/bookurl",
    });
    wrapper.setProps({ params: newParams });
    context = wrapper.instance().getChildContext();
    expect(context.library()).to.equal("library");

    newParams = Object.assign({}, params, {
      collectionUrl: null,
      bookUrl: null,
    });
    wrapper.setProps({ params: newParams });
    context = wrapper.instance().getChildContext();
    expect(context.library()).to.equal(null);
  });

  it("shows Footer", () => {
    const footer = wrapper.find(Footer);
    expect(footer.length).to.equal(1);
  });
});
