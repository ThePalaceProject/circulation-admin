import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import Dashboard from "../Dashboard";
import Header from "../Header";
import CirculationEvents from "../CirculationEvents";
import buildStore from "../../store";

describe("Dashboard", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store };
    wrapper = shallow(<Dashboard />, { context });
  });

  it("shows Header", () => {
    let header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("shows CirculationEvents", () => {
    let events = wrapper.find(CirculationEvents);
    expect(events.prop("store")).to.equal(store);
  });
});