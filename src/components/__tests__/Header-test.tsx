import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { Header } from "../Header";
import EditableInput from "../EditableInput";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";

describe("Header", () => {
  let wrapper;
  let push, context;

  beforeEach(() => {
    push = stub();
    context = { library: () => "nypl" };

    wrapper = shallow(
      <Header />,
      { context }
    );
  });

  describe("rendering", () => {
    it("shows the brand name", () => {
      expect(wrapper.containsMatchingElement("Admin")).to.equal(true);
    });

    it("shows library dropdown when libraries are available", () => {
      let select = wrapper.find(EditableInput);
      expect(select.length).to.equal(0);

      let libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" }
      ];
      wrapper.setProps({ libraries });
      select = wrapper.find(EditableInput);
      expect(select.length).to.equal(1);
      expect(select.props().elementType).to.equal("select");
      expect(select.props().value).to.equal("nypl");
      let options = select.children();
      expect(options.length).to.equal(2);
      expect(options.at(0).text()).to.equal("NYPL");
      expect(options.at(0).props().value).to.equal("nypl");
      expect(options.at(1).text()).to.equal("bpl");
      expect(options.at(1).props().value).to.equal("bpl");

      wrapper.setContext({ library: () => "bpl" });
      select = wrapper.find(EditableInput);
      expect(select.props().value).to.equal("bpl");

      wrapper.setContext({});
      select = wrapper.find(EditableInput);
      options = select.children();
      expect(options.length).to.equal(3);
      expect(options.at(0).text()).to.equal("Select a library");
      expect(options.at(1).text()).to.equal("NYPL");
      expect(options.at(1).props().value).to.equal("nypl");
      expect(options.at(2).text()).to.equal("bpl");
      expect(options.at(2).props().value).to.equal("bpl");
    });

    it("shows catalog links when there's a library", () => {
      let catalogLinks = wrapper.find(CatalogLink);

      expect(catalogLinks.length).to.equal(3);

      let mainCatalogLink = catalogLinks.at(0);
      expect(mainCatalogLink.prop("collectionUrl")).to.equal("/nypl/groups");
      expect(mainCatalogLink.prop("bookUrl")).to.equal(null);
      expect(mainCatalogLink.children().text()).to.equal("Catalog");

      let complaintsLink = catalogLinks.at(1);
      expect(complaintsLink.prop("collectionUrl")).to.equal("/nypl/admin/complaints");
      expect(complaintsLink.prop("bookUrl")).to.equal(null);
      expect(complaintsLink.children().text()).to.equal("Complaints");

      let hiddenLink = catalogLinks.at(2);
      expect(hiddenLink.prop("collectionUrl")).to.equal("/nypl/admin/suppressed");
      expect(hiddenLink.prop("bookUrl")).to.equal(null);
      expect(hiddenLink.children().text()).to.equal("Hidden Books");

      wrapper.setContext({});
      catalogLinks = wrapper.find(CatalogLink);
      expect(catalogLinks.length).to.equal(0);
    });

    it("shows sitewide links and non-catalog library links", () => {
      let links = wrapper.find(Link);

      let listsLink = links.at(0);
      expect(listsLink.prop("to")).to.equal("/admin/web/lists/nypl");
      expect(listsLink.children().text()).to.equal("Lists");

      let lanesLink = links.at(1);
      expect(lanesLink.prop("to")).to.equal("/admin/web/lanes/nypl");
      expect(lanesLink.children().text()).to.equal("Lanes");

      let dashboardLink = links.at(2);
      expect(dashboardLink.prop("to")).to.equal("/admin/web/dashboard");
      expect(dashboardLink.children().text()).to.equal("Dashboard");

      let settingsLink = links.at(3);
      expect(settingsLink.prop("to")).to.equal("/admin/web/config");
      expect(settingsLink.children().text()).to.equal("Configuration");

      wrapper.setContext({});
      links = wrapper.find(Link);

      dashboardLink = links.at(0);
      expect(dashboardLink.prop("to")).to.equal("/admin/web/dashboard");
    });
  });

  describe("behavior", () => {
    it("fetches libraries on mount", () => {
      let fetchLibraries = stub();
      wrapper = shallow(
        <Header
          fetchLibraries={fetchLibraries}
          />
      );
      expect(fetchLibraries.callCount).to.equal(1);
    });

    it("changes library", async () => {
      let libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" }
      ];
      let childContextTypes = {
        router: React.PropTypes.object.isRequired,
        pathFor: React.PropTypes.func.isRequired
      };
      let fullContext = Object.assign({}, context, {
        pathFor: stub().returns("url"),
        router: {
          createHref: stub(),
          push: stub(),
          isActive: stub(),
          replace: stub(),
          go: stub(),
          goBack: stub(),
          goForward: stub(),
          setRouteLeaveHook: stub()
        }
      });
      wrapper = mount(
        <Header
          libraries={libraries}
          />,
        { context: fullContext, childContextTypes }
      );
      let select = wrapper.find("select") as any;
      let selectElement = select.get(0);
      selectElement.value = "bpl";
      select.simulate("change");

      expect(fullContext.router.push.callCount).to.equal(1);
      expect(fullContext.router.push.args[0][0]).to.equal("/admin/web/collection/bpl%2Fgroups");
    });
  });
});