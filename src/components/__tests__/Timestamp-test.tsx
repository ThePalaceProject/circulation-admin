import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";

import Timestamp from "../Timestamp";
import { Panel } from "library-simplified-reusable-components";

describe("Timestamp", () => {
  let wrapper;
  let ts = {
    service: "test_service",
    id: "1",
    start: "start_time_string",
    duration: "60",
    collection_name: "collection1",
  };

  describe("rendering", () => {
    beforeEach(() => {
      wrapper = mount(
        <Timestamp timestamp={ts} />
      );
    });

    it("renders a panel", () => {
      let panel = wrapper.find(Panel);
      expect(panel.length).to.equal(1);
      expect(panel.prop("style")).to.equal("success");
      expect(panel.prop("collapsible")).to.be.false;
    });

    it("renders the start time", () => {
      let title = wrapper.find(".panel-title");
      expect(title.length).to.equal(1);
      expect(title.text()).to.equal("start_time_string");
    });

    it("renders the duration", () => {
      expect(wrapper.find("ul").length).to.equal(1);
      expect(wrapper.find("ul li").length).to.equal(1);
      expect(wrapper.find("ul li").text()).to.equal("Duration: 60 seconds");
    });
  });

  describe("rendering with achievements", () => {
    beforeEach(() => {
      let tsWithAchievements = Object.assign(ts, { achievements: "Ran a script" });
      wrapper = mount(
        <Timestamp timestamp={tsWithAchievements} />
      );
    });

    it("renders achievements", () => {
      expect(wrapper.find("ul li").length).to.equal(2);
      let achievements = wrapper.find(".well").find("pre");
      expect(achievements.length).to.equal(1);
      expect(achievements.text()).to.contain("Ran a script");
    });
  });

  describe("rendering with exception", () => {
    beforeEach(() => {
      let tsWithException = Object.assign(ts, { exception: "Stack trace" });
      wrapper = mount(
        <Timestamp timestamp={tsWithException} />
      );
    });

    it("determines style based on whether there is an exception", () => {
      let panel = wrapper.find(Panel);
      expect(panel.prop("style")).to.equal("danger");
    });

    it("renders an exception", () => {
      let exception = wrapper.find(".exception").find("pre");
      expect(exception.length).to.equal(1);
      expect(exception.text()).to.equal("Stack trace");
    });
  });
});
