import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import { EntryPointsTabs } from "../EntryPointsTabs";
import { mockRouterContext } from "./routing";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";

describe("EntryPointsTabs", () => {
  let wrapper;
  let context;
  let push;
  let store;
  let fetchLibraries = stub();
  let libraries = [
    {
      short_name: "library",
      settings: { enabled_entry_points: ["Book", "Audio"] }
    },
    {
      short_name: "library2",
      settings: { enabled_entry_points: ["Audio"] }
    },
    {
      short_name: "library3",
      settings: { enabled_entry_points: [] }
    },
  ];

  beforeEach(() => {
    store = buildStore();
    push = stub();
    context = mockRouterContext(push);
  });

  it("should not generate any tabs", () => {
    wrapper = shallow(
      <EntryPointsTabs
        fetchLibraries={fetchLibraries}
        libraries={libraries}
        collectionUrl="collection url"
        library={(a, b) => "library3"}
        store={store}
        activeValue="Book"
        homeLink="home url"
      />,
      { context }
    );

    let ul = wrapper.find(".nav-tabs");
    expect(ul.length).to.equal(0);
  });

  it("should generate two tabs with two entry points", () => {
    wrapper = shallow(
      <EntryPointsTabs
        fetchLibraries={fetchLibraries}
        libraries={libraries}
        collectionUrl="collection url"
        library={(a, b) => "library"}
        store={store}
        activeValue="Book"
        homeLink="home url"
      />,
      { context }
    );

    let ul = wrapper.find(".nav-tabs");
    expect(ul).to.be.ok;
    expect(ul.find("li").length).to.equal(2);
    expect(ul.find("li").at(0).prop("className")).to.equal("active ");
    expect(ul.find("li").at(1).prop("className")).to.equal(" ");

    let catalogLinks = wrapper.find(CatalogLink);
    expect(catalogLinks.length).to.equal(2);

    let bookLink = catalogLinks.at(0);
    let audioLink = catalogLinks.at(1);
    expect(bookLink.prop("collectionUrl")).to.equal("home url?entrypoint=Book");
    expect(bookLink.prop("bookUrl")).to.equal(null);
    expect(bookLink.children().at(1).text()).to.equal("eBooks");

    expect(audioLink.prop("collectionUrl")).to.equal("home url?entrypoint=Audio");
    expect(audioLink.prop("bookUrl")).to.equal(null);
    expect(audioLink.children().at(1).text()).to.equal("Audio Books");
  });

  it("should generate one tab with an active entry point", () => {
    wrapper = shallow(
      <EntryPointsTabs
        fetchLibraries={fetchLibraries}
        libraries={libraries}
        collectionUrl="collection url"
        library={(a, b) => "library2"}
        store={store}
        activeValue="Book"
        homeLink="home url"
      />,
      { context }
    );

    let ul = wrapper.find(".nav-tabs");
    expect(ul).to.be.ok;
    expect(ul.find("li").length).to.equal(1);
    expect(ul.find("li").at(0).prop("className")).to.equal(" ");

    let catalogLinks = wrapper.find(CatalogLink);
    expect(catalogLinks.length).to.equal(1);

    let bookLink = catalogLinks.at(0);
    expect(bookLink.prop("collectionUrl")).to.equal("home url?entrypoint=Audio");
    expect(bookLink.prop("bookUrl")).to.equal(null);
    expect(bookLink.children().at(1).text()).to.equal("Audio Books");
  });

  it("uses router to navigate when a tab is clicked", () => {
    wrapper = shallow(
      <EntryPointsTabs
        fetchLibraries={fetchLibraries}
        libraries={libraries}
        collectionUrl="collection url"
        library={(a, b) => "library"}
        store={store}
        activeValue="Audio"
        homeLink="home url"
      />,
      { context }
    );

    const links = wrapper.find("ul.nav-tabs").find(CatalogLink);
    const ebookLink = links.at(0);
    const audioBookLink = links.at(1);

    expect(ebookLink.prop("collectionUrl")).to.equal("home url?entrypoint=Book");
    expect(ebookLink.prop("bookUrl")).to.equal(null);
    expect(ebookLink.children().at(1).text()).to.equal("eBooks");

    expect(audioBookLink.prop("collectionUrl")).to.equal("home url?entrypoint=Audio");
    expect(audioBookLink.prop("bookUrl")).to.equal(null);
    expect(audioBookLink.children().at(1).text()).to.equal("Audio Books");
  });
});
