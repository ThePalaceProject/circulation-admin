import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import DashboardPage from "../DashboardPage";
import Header from "../Header";
import Footer from "../Footer";
import CirculationEvents from "../CirculationEvents";
import Stats from "../Stats";
import buildStore from "../../store";

describe("DashboardPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store };
    wrapper = shallow(<DashboardPage params={{}} />, { context });
  });

  it("shows Header", () => {
    const header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("shows CirculationEvents ", () => {
    let events = wrapper.find(CirculationEvents);
    expect(events.length).to.equal(1);
    expect(events.prop("store")).to.equal(store);
    expect(events.prop("library")).to.equal(undefined);

    wrapper.setProps({ params: { library: "NYPL" } });
    events = wrapper.find(CirculationEvents);
    expect(events.length).to.equal(1);
    expect(events.prop("library")).to.equal("NYPL");
  });

  it("shows Stats", () => {
    let stats = wrapper.find(Stats);
    expect(stats.prop("library")).to.be.undefined;

    wrapper.setProps({ params: { library: "NYPL" } });
    stats = wrapper.find(Stats);
    expect(stats.prop("library")).to.equal("NYPL");
  });

  it("shows Footer", () => {
    const footer = wrapper.find(Footer);
    expect(footer.length).to.equal(1);
  });
});
