import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import Collapsible from "../Collapsible";

describe("Collapsible", () => {

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <Collapsible title="TITLE!" body="INSTRUCTIONS!">
      </Collapsible>
    );
  });

  describe("rendering", () => {

    it("renders a panel component", () => {
      let panel = wrapper.find("Panel");
      expect(panel.length).to.equal(1);
      expect(panel.hasClass("collapsible")).to.be.true;
    });

    it("is collapsed by default", () => {
      expect(wrapper.state().open).to.be.false;
      expect(wrapper.state().icon).to.equal("chevron-down");

      let panel = wrapper.find("Panel");
      expect(panel.props().expanded).to.be.false;
      expect(panel.props().defaultExpanded).to.be.false;
    });

    it("receives the correct title and body props", () => {
      expect(wrapper.props().title).to.equal("TITLE!");
      expect(wrapper.props().body).to.equal("INSTRUCTIONS!");
    });

    it("renders a heading with a title and a toggle button", () => {
      let heading = wrapper.find(".panel-heading");
      expect(heading.length).to.equal(1);
      expect(heading.text()).to.equal("TITLE!");

      let button = heading.find("button");
      expect(button.length).to.equal(1);
      let icon = button.find(".glyphicon");
      expect(icon.length).to.equal(1);
      expect(icon.props().glyph).to.equal(wrapper.state().icon);
    });

    it("renders a collapsible body section with the correct content", () => {
      let body = wrapper.find(".panel-body");
      expect(body.length).to.equal(1);
      expect(body.text()).to.equal("INSTRUCTIONS!");
    });

  });

  describe("behavior", () => {

    it("expands and collapses when clicked", () => {
      let panel = wrapper.find("Panel");
      expect(wrapper.state().open).to.be.false;
      expect(panel.props().expanded).to.be.false;

      let title = wrapper.find(".panel-title");
      title.simulate("click");

      expect(wrapper.state().open).to.be.true;
      expect(panel.props().expanded).to.be.true;

      title.simulate("click");

      expect(wrapper.state().open).to.be.false;
      expect(panel.props().expanded).to.be.false;
    });

    it("flips the toggle icon when clicked", () => {
      let icon = wrapper.find(".glyphicon");
      expect(wrapper.state().icon).to.equal("chevron-down");
      expect(icon.props().glyph).to.equal("chevron-down");

      let title = wrapper.find(".panel-title");
      title.simulate("click");

      expect(wrapper.state().icon).to.equal("chevron-up");
      expect(icon.props().glyph).to.equal("chevron-up");

      title.simulate("click");

      expect(wrapper.state().icon).to.equal("chevron-down");
      expect(icon.props().glyph).to.equal("chevron-down");
    });

  });

});
