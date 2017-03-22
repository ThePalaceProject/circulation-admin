import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import Header from "../Header";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";

describe("Header", () => {
  let wrapper;
  let push, context;

  beforeEach(() => {
    push = stub();
    context = { homeUrl: "home url" };

    wrapper = shallow(
      <Header />,
      { context }
    );
  });

  it("shows the brand name", () => {
    expect(wrapper.containsMatchingElement("Admin")).to.equal(true);
  });

  it("shows links", () => {
    let catalogLinks = wrapper.find(CatalogLink);

    expect(catalogLinks.length).to.equal(3);

    let homeLink = catalogLinks.at(0);
    expect(homeLink.prop("collectionUrl")).to.equal("home url");
    expect(homeLink.prop("bookUrl")).to.equal(null);
    expect(homeLink.children().text()).to.equal("Catalog");

    let complaintsLink = catalogLinks.at(1);
    expect(complaintsLink.prop("collectionUrl")).to.equal("/admin/complaints");
    expect(complaintsLink.prop("bookUrl")).to.equal(null);
    expect(complaintsLink.children().text()).to.equal("Complaints");

    let hiddenLink = catalogLinks.at(2);
    expect(hiddenLink.prop("collectionUrl")).to.equal("/admin/suppressed");
    expect(hiddenLink.prop("bookUrl")).to.equal(null);
    expect(hiddenLink.children().text()).to.equal("Hidden Books");

    let links = wrapper.find(Link);

    let dashboardLink = links.at(0);
    expect(dashboardLink.prop("to")).to.equal("/admin/web/dashboard");
    expect(dashboardLink.children().text()).to.equal("Dashboard");

    let settingsLink = links.at(1);
    expect(settingsLink.prop("to")).to.equal("/admin/web/config");
    expect(settingsLink.children().text()).to.equal("Configuration");
  });
});