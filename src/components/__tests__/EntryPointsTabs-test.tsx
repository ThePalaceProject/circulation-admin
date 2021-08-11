import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { EntryPointsTabs } from "../EntryPointsTabs";
import { mockRouterContext } from "./routing";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";

describe("EntryPointsTabs", () => {
  let wrapper;
  let context;
  let push;
  let facets = [
    {
      label: "eBooks",
      href: "http://circulation.librarysimplified.org/groups/?entrypoint=Book",
      active: true,
    },
    {
      label: "Audiobooks",
      href: "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
      active: false,
    },
  ];

  beforeEach(() => {
    push = stub();
    context = mockRouterContext(push);
  });

  it("should not generate any tabs", () => {
    wrapper = shallow(<EntryPointsTabs />, { context });

    const ul = wrapper.find(".nav-tabs");
    expect(ul.length).to.equal(0);
  });

  it("should generate two tabs with two entry points", () => {
    wrapper = shallow(<EntryPointsTabs facets={facets} />, { context });

    const ul = wrapper.find(".nav-tabs");
    expect(ul).to.be.ok;
    expect(ul.find("li").length).to.equal(2);
    expect(ul.find("li").at(0).prop("className")).to.equal("active ");
    expect(ul.find("li").at(1).prop("className")).to.equal(" ");

    const catalogLinks = wrapper.find(CatalogLink);
    expect(catalogLinks.length).to.equal(2);

    const bookLink = catalogLinks.at(0);
    const audioLink = catalogLinks.at(1);
    expect(bookLink.children().at(1).text()).to.equal("eBooks");
    expect(audioLink.children().at(1).text()).to.equal("Audiobooks");
  });

  it("uses router to navigate when a tab is clicked", () => {
    wrapper = shallow(<EntryPointsTabs facets={facets} />, { context });

    const links = wrapper.find("ul.nav-tabs").find(CatalogLink);
    const ebookLink = links.at(0);
    const audioBookLink = links.at(1);

    expect(ebookLink.children().at(1).text()).to.equal("eBooks");

    expect(audioBookLink.children().at(1).text()).to.equal("Audiobooks");
  });

  it("should generate one tab with an active entry point", () => {
    facets = [
      {
        label: "Audiobooks",
        href:
          "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
        active: true,
      },
    ];
    wrapper = shallow(<EntryPointsTabs facets={facets} />, { context });

    const ul = wrapper.find(".nav-tabs");
    expect(ul).to.be.ok;
    expect(ul.find("li").length).to.equal(1);
    expect(ul.find("li").at(0).prop("className")).to.equal("active ");

    const catalogLinks = wrapper.find(CatalogLink);
    expect(catalogLinks.length).to.equal(1);

    const bookLink = catalogLinks.at(0);
    expect(bookLink.children().at(1).text()).to.equal("Audiobooks");
  });
});
